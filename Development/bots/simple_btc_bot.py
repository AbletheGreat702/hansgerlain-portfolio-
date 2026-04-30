# Simple Bitcoin Trading Bot (Binance, Python)
# Requirements: pip install python-binance

from binance.client import Client
import time
import os

# Set your Binance API credentials
API_KEY = os.getenv('BINANCE_API_KEY', 'your_api_key_here')
API_SECRET = os.getenv('BINANCE_API_SECRET', 'your_api_secret_here')

client = Client(API_KEY, API_SECRET)

symbol = 'BTCUSDT'
quantity = 0.001  # Amount of BTC to buy/sell

# Simple strategy: Buy if price drops by 1%, sell if price rises by 1%
def get_price():
    ticker = client.get_symbol_ticker(symbol=symbol)
    return float(ticker['price'])

def place_order(side, quantity):
    order = client.create_order(
        symbol=symbol,
        side=side,
        type='MARKET',
        quantity=quantity
    )
    print(f"Order placed: {side} {quantity} BTC")
    return order

def main():
    print("Starting simple BTC bot...")
    last_price = get_price()
    print(f"Initial price: {last_price}")
    while True:
        price = get_price()
        change = (price - last_price) / last_price
        print(f"Current price: {price} | Change: {change*100:.2f}%")
        if change <= -0.01:
            place_order('BUY', quantity)
            last_price = price
        elif change >= 0.01:
            place_order('SELL', quantity)
            last_price = price
        time.sleep(30)  # Check every 30 seconds

if __name__ == "__main__":
    main()
