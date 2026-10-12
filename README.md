# 量化，从零开始

面向零基础学习者的中文互动网站：[打开课程](https://felixw-123.github.io/quant-from-zero/)。本仓库独立于学校 TAC 作业仓库。

## 打开网站

直接用浏览器打开 `index.html`。网站只使用 HTML、CSS 和 JavaScript，不需要安装依赖，也不需要账户。

## 可以做什么

- 点击 K 线或使用左右按钮，观察开盘、最高、最低、收盘价。
- 打开或关闭 5 日均线，理解它是过去五个收盘价的平均数。
- 完成六节入门课和六阶段学徒训练；完成进度仅保存在当前浏览器。
- 调整模拟交易成本，再运行“3 日均线高于 7 日均线”的教学回测。
- 用仓位计算器同时考虑单笔风险、单股资金上限与可用现金。
- 下载 Python 脚本和 CSV 样本，在本机运行含仓位、费用、滑点、止损与最大回撤的简化回测。

## 运行 Python 示例

```bash
python3 quant_lab.py --csv sample_prices.csv
python3 quant_lab.py --csv sample_prices.csv --risk-pct 0.5 --max-allocation-pct 10
```

Python 3 标准库即可运行；详细任务见 [EXERCISES.md](./EXERCISES.md)。

图表中的价格是人为编写的教学数据。脚本只支持多头整股，在昨日收盘产生信号、今日开盘交易。止损与滑点采用简化估算；OHLC 不能还原日内真实成交顺序。历史结果不能保证未来收益。脚本不连接券商，也不会发出真实订单。

## 文件

- `index.html`：页面结构与说明文字
- `style.css`：视觉设计与响应式布局
- `app.js`：六节课程、K 线、练习、进度和回测交互
- `quant_lab.py`：标准库 Python 回测与仓位管理示例
- `sample_prices.csv`：与页面 K 线对应的模拟数据
- `EXERCISES.md`：分阶段练习、命令和复盘模板
