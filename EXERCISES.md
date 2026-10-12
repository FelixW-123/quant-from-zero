# 量化学徒练习手册

这里的价格全部是人为编写的教学数据。练习目标是形成研究习惯，不是找一条保证赚钱的规则。

## 先跑起来

安装 Python 3 后，在包含本文件的文件夹运行：

```bash
python3 quant_lab.py --csv sample_prices.csv
```

Windows 如使用 Python Launcher，可把 `python3` 换成 `py`。脚本只用 Python 标准库，不需要安装包，也不会下单。

## 六阶段交付物

| 阶段 | 交付物 | 自检问题 |
| --- | --- | --- |
| 1. 市场语言 | 3 根 K 线的 OHLC 手写解释、交易流程图 | 信号产生时，哪些价格已经知道？ |
| 2. 数据与 Python | 一份 CSV 数据说明、至少一次故意制造的错误 | 数据是否复权？有没有缺失/乱序？ |
| 3. 清晰规则 | 一页规则卡：观察、入场、退出、仓位 | 别人按文字能复现吗？ |
| 4. 回测 | 含基准、费用、回撤的报告 | 换一段时间结果还成立吗？ |
| 5. 仓位 | 10 笔纸面交易的计划股数、风险和实际结果 | 跳空亏损会不会超预算？ |
| 6. 独立研究 | 版本固定的代码、数据来源、日志、失败案例 | 不看未来数据还能执行吗？ |

## 三个立刻动手的实验

1. **成本实验**：先运行默认值，再运行 `python3 quant_lab.py --csv sample_prices.csv --fee-bps 50 --slippage-bps 20`。写下最终资金和最大回撤变化。1 bps = 0.01%。
2. **仓位实验**：运行 `python3 quant_lab.py --csv sample_prices.csv --risk-pct 0.5 --max-allocation-pct 10`。比较成交股数和结果。解释是风险预算还是资金上限先限制了股数。
3. **未知数据实验**：找一份合法授权导出的日线 CSV，整理成 `date,open,high,low,close` 五列，按日期升序。先不改策略，运行一次。记录品种、数据来源、日期范围、是否复权、费用假设。不要只挑表现好的品种或时间段。

## 关键计算

假设账户 10,000 美元，单笔计划风险 1%，买入价 100 美元，止损价 95 美元，单股资金上限 20%：

- 风险预算 = 10,000 × 1% = 100 美元。
- 每股计划风险 = 100 − 95 = 5 美元。
- 按风险最多 20 股；按资金上限最多 20 股；计划买入 20 股。
- 按止损价估算的亏损是 100 美元，实际价格跳空或滑点可能让亏损更大。

脚本额外模拟手续费和滑点；它按昨天收盘的均线，在今天开盘交易；卖出时如果今天开盘已经低于止损价，就按较低的开盘价估算。OHLC 数据无法确定真实日内成交顺序，所以结果只是简化模型。

## 复盘模板

```text
研究问题：
数据来源、品种、时间范围、复权方式：
入场、退出、仓位规则：
何时产生信号、何时成交：
手续费、滑点、止损假设：
策略与基准最终资金：
最大回撤与最差时期：
至少三个可能让结果失真的原因：
下一次只改动的一个假设：
```

## 可靠资料

- [Python 官方教程](https://docs.python.org/3/tutorial/)
- [pandas 官方入门](https://pandas.pydata.org/docs/getting_started/)
- [SEC：历史与回测表现的限制](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-47)
- [SEC：资产配置与分散投资](https://www.investor.gov/introduction-investing/getting-started/asset-allocation)
- [FINRA：止损单可能以不同价格成交](https://www.finra.org/sites/default/files/2021-03/Regulatory-Notice-21-12.pdf)
