"""从零开始的教学回测：标准库即可运行，不连接券商、不下单。

python3 quant_lab.py --csv sample_prices.csv
python3 quant_lab.py --csv sample_prices.csv --risk-pct 0.5 --max-allocation-pct 15
"""

from __future__ import annotations

import argparse
import csv
import math
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Bar:
    date: str
    open: float
    high: float
    low: float
    close: float


def load_bars(path: Path) -> list[Bar]:
    """读取 date,open,high,low,close；拒绝不合理或乱序数据。"""
    bars: list[Bar] = []
    with path.open(newline="", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)
        required = {"date", "open", "high", "low", "close"}
        if not reader.fieldnames or not required.issubset(reader.fieldnames):
            raise ValueError("CSV 需要 date,open,high,low,close 五列")
        for line, row in enumerate(reader, start=2):
            try:
                date = row["date"].strip()
                o, h, l, c = (float(row[key]) for key in ("open", "high", "low", "close"))
            except (TypeError, ValueError, AttributeError) as exc:
                raise ValueError(f"第 {line} 行存在空值或无效价格") from exc
            if not date or not all(math.isfinite(x) and x > 0 for x in (o, h, l, c)):
                raise ValueError(f"第 {line} 行日期或价格无效")
            if l > min(o, c) or h < max(o, c) or l > h:
                raise ValueError(f"第 {line} 行不符合 low ≤ open/close ≤ high")
            if bars and date <= bars[-1].date:
                raise ValueError(f"第 {line} 行日期没有严格递增")
            bars.append(Bar(date, o, h, l, c))
    if not bars:
        raise ValueError("CSV 没有数据")
    return bars


def planned_shares(
    equity: float,
    cash: float,
    buy_price: float,
    stop_price: float,
    risk_pct: float,
    max_allocation_pct: float,
    fee_bps: float = 0,
) -> int:
    """风险预算、单股资金上限、现金三者取最小；仅支持多头整股。"""
    values = (equity, cash, buy_price, stop_price, risk_pct, max_allocation_pct, fee_bps)
    if not all(math.isfinite(x) for x in values):
        raise ValueError("参数须为有限数字")
    if equity <= 0 or cash < 0 or buy_price <= 0 or not 0 < stop_price < buy_price:
        raise ValueError("账户/价格无效；止损价须低于买入价")
    if not 0 < risk_pct <= 100 or not 0 < max_allocation_pct <= 100 or fee_bps < 0:
        raise ValueError("风险、仓位上限或费用无效")
    risk_budget = equity * risk_pct / 100
    fee_rate = fee_bps / 10_000
    return max(0, min(
        math.floor(risk_budget / (buy_price - stop_price)),
        math.floor(equity * max_allocation_pct / 100 / buy_price),
        math.floor(cash / (buy_price * (1 + fee_rate))),
    ))


def max_drawdown(values: list[float]) -> float:
    peak = values[0]
    worst = 0.0
    for value in values:
        peak = max(peak, value)
        worst = max(worst, (peak - value) / peak)
    return worst


def backtest(
    bars: list[Bar],
    initial_cash: float = 10_000,
    risk_pct: float = 1,
    max_allocation_pct: float = 20,
    stop_pct: float = 5,
    fee_bps: float = 10,
    slippage_bps: float = 5,
    short_window: int = 3,
    long_window: int = 7,
) -> dict:
    """昨日收盘产生信号，今日开盘执行；止损按跳空/日内触发估算。"""
    if initial_cash <= 0 or not 0 < stop_pct < 100 or fee_bps < 0 or slippage_bps < 0:
        raise ValueError("资金、止损比例或成本无效")
    if not 1 <= short_window < long_window:
        raise ValueError("均线窗口须满足 1 ≤ 短期 < 长期")
    if len(bars) < long_window + 1:
        raise ValueError(f"至少需要 {long_window + 1} 个交易日")
    # 入口处统一验证风险参数，即使示例期间没有交易。
    planned_shares(initial_cash, initial_cash, 100, 100 * (1 - stop_pct / 100), risk_pct, max_allocation_pct, fee_bps)
    fee = fee_bps / 10_000
    slip = slippage_bps / 10_000
    cash = initial_cash
    shares = 0
    stop = None
    trades: list[dict] = []
    equity_curve = [initial_cash]
    closes = [bar.close for bar in bars]

    # 基准：第一天开盘全额买入并持有，使用相同费用和滑点。
    benchmark_buy = bars[0].open * (1 + slip)
    benchmark_shares = math.floor(initial_cash / (benchmark_buy * (1 + fee)))
    benchmark_cash = initial_cash - benchmark_shares * benchmark_buy * (1 + fee)
    benchmark_curve = [initial_cash]

    for index, bar in enumerate(bars):
        if index >= long_window:
            short_ma = sum(closes[index-short_window:index]) / short_window
            long_ma = sum(closes[index-long_window:index]) / long_window
            wants_position = short_ma > long_ma
        else:
            wants_position = False

        if shares and not wants_position:
            sell_price = bar.open * (1 - slip)
            cash += shares * sell_price * (1 - fee)
            trades.append({"date": bar.date, "action": "均线退出", "shares": shares, "price": sell_price})
            shares, stop = 0, None

        if not shares and wants_position:
            buy_price = bar.open * (1 + slip)
            proposed_stop = buy_price * (1 - stop_pct / 100)
            quantity = planned_shares(cash, cash, buy_price, proposed_stop, risk_pct, max_allocation_pct, fee_bps)
            if quantity:
                cash -= quantity * buy_price * (1 + fee)
                shares, stop = quantity, proposed_stop
                trades.append({"date": bar.date, "action": "均线入场", "shares": quantity, "price": buy_price})

        if shares and bar.low <= stop:
            # 开盘已低于止损：按开盘卖；否则按止损价卖。二者都再扣滑点。
            sell_price = min(bar.open, stop) * (1 - slip)
            cash += shares * sell_price * (1 - fee)
            trades.append({"date": bar.date, "action": "止损退出", "shares": shares, "price": sell_price})
            shares, stop = 0, None

        equity_curve.append(cash + shares * bar.close)
        benchmark_curve.append(benchmark_cash + benchmark_shares * bar.close)

    return {
        "final_equity": equity_curve[-1],
        "benchmark_final": benchmark_curve[-1],
        "max_drawdown": max_drawdown(equity_curve),
        "benchmark_drawdown": max_drawdown(benchmark_curve),
        "trades": trades,
        "equity_curve": equity_curve,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="从零开始的教学回测，不连接券商")
    parser.add_argument("--csv", type=Path, default=Path(__file__).with_name("sample_prices.csv"))
    parser.add_argument("--initial-cash", type=float, default=10_000)
    parser.add_argument("--risk-pct", type=float, default=1)
    parser.add_argument("--max-allocation-pct", type=float, default=20)
    parser.add_argument("--stop-pct", type=float, default=5)
    parser.add_argument("--fee-bps", type=float, default=10, help="1 bps = 0.01%%")
    parser.add_argument("--slippage-bps", type=float, default=5)
    parser.add_argument("--short-window", type=int, default=3)
    parser.add_argument("--long-window", type=int, default=7)
    args = parser.parse_args()
    result = backtest(
        load_bars(args.csv), args.initial_cash, args.risk_pct,
        args.max_allocation_pct, args.stop_pct, args.fee_bps,
        args.slippage_bps, args.short_window, args.long_window,
    )
    print(f"模拟策略结束资金: ${result['final_equity']:,.2f}")
    print(f"一直持有结束资金: ${result['benchmark_final']:,.2f}")
    print(f"模拟策略最大回撤: {result['max_drawdown']:.2%}")
    print(f"一直持有最大回撤: {result['benchmark_drawdown']:.2%}")
    print(f"成交记录: {len(result['trades'])} 条")
    for trade in result["trades"]:
        print(f"  {trade['date']}  {trade['action']}  {trade['shares']} 股 @ ${trade['price']:.2f}")
    print("注意：示例仅用于教学；OHLC 无法还原日内真实成交顺序，止损也不能保证实际价格。")


if __name__ == "__main__":
    main()
