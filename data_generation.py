import pandas as pd
from faker import Faker
import random

fakers = {
    'en_IN': Faker('en_IN'),
    'en_GB': Faker('en_GB'),
    'en_AU': Faker('en_AU'),
    'en_IE': Faker('en_IE'),
    'en_PH': Faker('en_PH')
}
Faker.seed(42)
random.seed(42) 

NUM_ROWS = 2000
restaurants = [
    "Dominos", "Pizza Hut", "Subway", "KFC", 
    "Biryani House", "Taj Mahal", "Spice Kitchen",
    "Burger King", "Mc Donalds", "Taco Bell",
    "Noodle Paradise", "Dragon Wok", "Pasta Corner"
]

menu_items = {
    "Dominos": ["Pepperoni Pizza", "Margherita Pizza", "Veggie Pizza", "BBQ Chicken Pizza"],
    "Pizza Hut": ["Cheese Pizza", "Super Cheese Pizza", "Paneer Pizza", "Chicken Pizza"],
    "Subway": ["Veggie Sub", "Chicken Sub", "Turkey Sub", "Italian BMT"],
    "KFC": ["Chicken Bucket", "Chicken Strips", "Zinger Burger", "Chicken Wings"],
    "Biryani House": ["Chicken Biryani", "Mutton Biryani", "Vegetable Biryani", "Hyderabadi Dum Biryani"],
    "Taj Mahal": ["Paneer Tikka", "Tandoori Chicken", "Butter Chicken", "Dal Makhani"],
    "Spice Kitchen": ["Chana Masala", "Aloo Gobi", "Paneer Curry", "Rogan Josh"],
    "Burger King": ["Whopper Burger", "Crispy Veg Burger", "Spicy Burger", "Royal Burger"],
    "Mc Donalds": ["Big Mac", "Quarter Pounder", "McVeggie", "McSpicy"],
    "Taco Bell": ["Crunchy Taco", "Soft Taco", "Burrito", "Quesadilla"],
    "Noodle Paradise": ["Ramen", "Lo Mein", "Pad Thai", "Chow Mein"],
    "Dragon Wok": ["Fried Rice", "Egg Noodles", "Schezwan Rice", "Hakka Noodles"],
    "Pasta Corner": ["Spaghetti Carbonara", "Penne Arrabbiata", "Fettuccine Alfredo", "Lasagna"]
}

data=[]
order_id = 1
for locale in fakers:
    fake = fakers[locale]
    for _ in range(400):
        rest = random.choice(restaurants)
        row = {
            "order_id": order_id,
            "customer_name": fake.name(),
            "restaurant": rest,
            "food_item": random.choice(menu_items[rest]),
            "order_amount": round(random.uniform(50, 500), 2),
            "delivery_time": random.randint(10, 60),

        }
        data.append(row)
        order_id += 1

df=pd.DataFrame(data)
df.to_csv("orders.csv", index=False)
print("Data Generation Complete")
print(f"Rows Generated:{len(df)}")
print("Saved to: orders.csv")
print("First 5 rows:")
print(df.head())
print(f"  • Memory: {df.memory_usage(deep=True).sum() / 1024:.2f} KB")
print(f"  • Columns: {list(df.columns)}")
print(f"  • Rows: {len(df)}")
print("Data info:")
print(df.info())
print("Data summary:")
print(df.describe())