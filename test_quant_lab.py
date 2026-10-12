"""Run with: python3 -m unittest test_quant_lab.py"""

import unittest

from quant_lab import Bar, backtest, planned_shares


class QuantLabTests(unittest.TestCase):
    def test_position_size_obeys_both_limits(self):
        self.assertEqual(planned_shares(10_000, 10_000, 100, 95, 1, 20), 20)
        self.assertEqual(planned_shares(10_000, 10_000, 100, 95, 1, 10), 10)
        with self.assertRaises(ValueError):
            planned_shares(10_000, 10_000, 100, 105, 1, 20)

    def test_entry_uses_previous_closes(self):
        base = [
            Bar('d1', 10, 10, 10, 10),
            Bar('d2', 11, 11, 11, 11),
            Bar('d3', 12, 12, 12, 12),
        ]
        low_close = base + [Bar('d4', 12, 12, 11, 11)]
        high_close = base + [Bar('d4', 12, 20, 12, 20)]
        settings = dict(short_window=2, long_window=3, stop_pct=25, fee_bps=0, slippage_bps=0)
        first = backtest(low_close, **settings)['trades'][0]
        second = backtest(high_close, **settings)['trades'][0]
        self.assertEqual((first['date'], first['shares'], first['price']),
                         (second['date'], second['shares'], second['price']))
        self.assertEqual(first['date'], 'd4')

    def test_gap_can_exceed_planned_risk(self):
        bars = [
            Bar('d1', 10, 10, 10, 10),
            Bar('d2', 11, 11, 11, 11),
            Bar('d3', 12, 12, 12, 12),
            Bar('d4', 12, 12, 12, 12),
            Bar('d5', 8, 8, 7, 8),
        ]
        result = backtest(bars, initial_cash=1000, risk_pct=10,
                          max_allocation_pct=100, stop_pct=10,
                          fee_bps=0, slippage_bps=0,
                          short_window=2, long_window=3)
        stop = next(t for t in result['trades'] if t['action'] == '止损退出')
        self.assertEqual(stop['price'], 8)
        self.assertGreater(1000 - result['final_equity'], 100)


if __name__ == '__main__':
    unittest.main()
