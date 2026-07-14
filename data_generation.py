import argparse
import csv
import random
from faker import Faker


def build_fakers():
    return {
        'en_IN': Faker('en_IN'),
        'en_GB': Faker('en_GB'),
        'en_AU': Faker('en_AU'),
        'en_IE': Faker('en_IE'),
        'en_PH': Faker('en_PH')
    }


def generate_orders(output_path, num_rows):
    fakers = build_fakers()
    Faker.seed(42)
    random.seed(42)

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

    locale_names = list(fakers.keys())
    fieldnames = ["order_id", "customer_name", "restaurant", "food_item", "order_amount", "delivery_time"]

    with open(output_path, "w", newline="", encoding="utf-8") as file_handle:
        writer = csv.DictWriter(file_handle, fieldnames=fieldnames)
        writer.writeheader()

        for order_id in range(1, num_rows + 1):
            locale_key = locale_names[(order_id - 1) % len(locale_names)]
            fake = fakers[locale_key]
            restaurant = random.choice(restaurants)
            row = {
                "order_id": order_id,
                "customer_name": fake.name(),
                "restaurant": restaurant,
                "food_item": random.choice(menu_items[restaurant]),
                "order_amount": round(random.uniform(50, 500), 2),
                "delivery_time": random.randint(10, 60),
            }
            writer.writerow(row)

    print("Data Generation Complete")
    print(f"Rows Generated: {num_rows}")
    print(f"Saved to: {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Generate synthetic food-order CSV data")
    parser.add_argument("--rows", type=int, default=1_000_000, help="Number of rows to generate (default: 1_000_000)")
    parser.add_argument("--output", default="orders.csv", help="Output CSV file path")
    args = parser.parse_args()

    generate_orders(args.output, args.rows)


if __name__ == "__main__":
    main()