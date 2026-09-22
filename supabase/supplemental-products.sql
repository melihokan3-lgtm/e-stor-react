-- Run once after supabase/schema.sql and supabase/seed.sql.
-- These rows make the supplemental demo catalogs orderable without trusting
-- product prices received from the browser.

insert into public.products (id, title, price, category, image)
values
  (100001, 'Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops', 109.95, 'Featured · men''s clothing', 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png'),
  (100002, 'Mens Casual Premium Slim Fit T-Shirts', 22.30, 'Featured · men''s clothing', 'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_t.png'),
  (100003, 'Mens Cotton Jacket', 55.99, 'Featured · men''s clothing', 'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_t.png'),
  (100004, 'Mens Casual Slim Fit', 15.99, 'Featured · men''s clothing', 'https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_t.png'),
  (100005, 'John Hardy Women''s Legends Naga Gold & Silver Dragon Station Chain Bracelet', 695.00, 'Featured · jewelery', 'https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_t.png'),
  (100006, 'Solid Gold Petite Micropave', 168.00, 'Featured · jewelery', 'https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_t.png'),
  (100007, 'White Gold Plated Princess', 9.99, 'Featured · jewelery', 'https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_QL65_ML3_t.png'),
  (100008, 'Pierced Owl Rose Gold Plated Stainless Steel Double', 10.99, 'Featured · jewelery', 'https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_ML3_t.png'),
  (100009, 'WD 2TB Elements Portable External Hard Drive - USB 3.0', 64.00, 'Featured · electronics', 'https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_t.png'),
  (100010, 'SanDisk SSD PLUS 1TB Internal SSD - SATA III 6 Gb/s', 109.00, 'Featured · electronics', 'https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_t.png'),
  (100011, 'Silicon Power 256GB SSD 3D NAND A55 SLC Cache Performance Boost SATA III 2.5', 109.00, 'Featured · electronics', 'https://fakestoreapi.com/img/71kWymZ+c+L._AC_SX679_t.png'),
  (100012, 'WD 4TB Gaming Drive Works with Playstation 4 Portable External Hard Drive', 114.00, 'Featured · electronics', 'https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_t.png'),
  (100013, 'Acer SB220Q bi 21.5 inches Full HD IPS Ultra-Thin', 599.00, 'Featured · electronics', 'https://fakestoreapi.com/img/81QpkIctqPL._AC_SX679_t.png'),
  (100014, 'Samsung 49-Inch CHG90 144Hz Curved Gaming Monitor', 999.99, 'Featured · electronics', 'https://fakestoreapi.com/img/81Zt42ioCgL._AC_SX679_t.png'),
  (100015, 'BIYLACLESEN Women''s 3-in-1 Snowboard Jacket Winter Coats', 56.99, 'Featured · women''s clothing', 'https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_t.png'),
  (100016, 'Lock and Love Women''s Removable Hooded Faux Leather Jacket', 29.95, 'Featured · women''s clothing', 'https://fakestoreapi.com/img/81XH0e8fefL._AC_UY879_t.png'),
  (100017, 'Rain Jacket Women Windbreaker Striped Climbing Raincoats', 39.99, 'Featured · women''s clothing', 'https://fakestoreapi.com/img/71HblAHs5xL._AC_UY879_-2t.png'),
  (100018, 'MBJ Women''s Solid Short Sleeve Boat Neck', 9.85, 'Featured · women''s clothing', 'https://fakestoreapi.com/img/71z3kpMAYsL._AC_UY879_t.png'),
  (100019, 'Opna Women''s Short Sleeve Moisture', 7.95, 'Featured · women''s clothing', 'https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_t.png'),
  (100020, 'DANVOUY Womens T Shirt Casual Cotton Short', 12.99, 'Featured · women''s clothing', 'https://fakestoreapi.com/img/61pHAEJ4NML._AC_UX679_t.png'),
  (200001, 'Long sleeve Jacket', 135.00, 'Collection · women', 'https://images.pexels.com/photos/2584269/pexels-photo-2584269.jpeg'),
  (200002, 'Jacket with wollen hat', 58.50, 'Collection · women', 'https://images.pexels.com/photos/2681751/pexels-photo-2681751.jpeg'),
  (200003, 'Compact fashion t-shirt', 50.39, 'Collection · women', 'https://images.pexels.com/photos/2752045/pexels-photo-2752045.jpeg'),
  (200004, 'Blue jins', 45.00, 'Collection · women', 'https://images.pexels.com/photos/1485031/pexels-photo-1485031.jpeg'),
  (200005, 'Skirts with full setup', 625.50, 'Collection · women', 'https://images.pexels.com/photos/1631181/pexels-photo-1631181.jpeg'),
  (200006, 'Yellow Hoody', 162.00, 'Collection · men', 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg'),
  (200007, 'Black t-shirt for women', 18.00, 'Collection · women', 'https://images.pexels.com/photos/2010812/pexels-photo-2010812.jpeg'),
  (200008, 'Gouwn with Red velvet', 315.00, 'Collection · women', 'https://images.pexels.com/photos/2233703/pexels-photo-2233703.jpeg'),
  (200009, 'Pink beauty', 90.00, 'Collection · women', 'https://images.pexels.com/photos/2065195/pexels-photo-2065195.jpeg'),
  (200010, 'Jean''s stylish Jacket', 220.50, 'Collection · men', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'),
  (200011, 'Jamdani Saree', 720.00, 'Collection · women', 'https://images.pexels.com/photos/3363204/pexels-photo-3363204.jpeg'),
  (200012, 'Black Jacket', 126.00, 'Collection · men', 'https://images.pexels.com/photos/983497/pexels-photo-983497.jpeg'),
  (200013, 'Black top with jeans', 108.00, 'Collection · women', 'https://images.pexels.com/photos/3672825/pexels-photo-3672825.jpeg'),
  (200014, 'Clothes with bag', 45.00, 'Collection · kids', 'https://images.pexels.com/photos/36029/aroni-arsa-children-little.jpg'),
  (200015, 'Stylish jeans in lightblue', 90.00, 'Collection · women', 'https://images.pexels.com/photos/2738792/pexels-photo-2738792.jpeg'),
  (200016, 'Unknown horizon', 315.00, 'Collection · men', 'https://images.pexels.com/photos/2866077/pexels-photo-2866077.jpeg'),
  (200017, 'Light tops', 108.00, 'Collection · women', 'https://images.pexels.com/photos/2010925/pexels-photo-2010925.jpeg'),
  (200018, 'Khakhi jeans', 171.00, 'Collection · women', 'https://images.pexels.com/photos/3054973/pexels-photo-3054973.jpeg'),
  (200019, 'Black full sleeve', 153.00, 'Collection · women', 'https://images.pexels.com/photos/2693849/pexels-photo-2693849.jpeg'),
  (200020, 'Formal for Men', 441.00, 'Collection · men', 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg'),
  (200021, 'White Casual Shirt', 67.50, 'Collection · men', 'https://images.pexels.com/photos/28570315/pexels-photo-28570315.jpeg'),
  (200022, 'Floral Maxi Dress', 162.00, 'Collection · women', 'https://images.pexels.com/photos/12915247/pexels-photo-12915247.jpeg'),
  (200023, 'Kids Denim Jacket', 76.50, 'Collection · kids', 'https://images.pexels.com/photos/1619709/pexels-photo-1619709.jpeg'),
  (200024, 'Gray Sweatpants', 54.00, 'Collection · men', 'https://images.pexels.com/photos/6311314/pexels-photo-6311314.jpeg'),
  (200025, 'Leather Belt', 36.00, 'Collection · men', 'https://images.pexels.com/photos/2671517/pexels-photo-2671517.jpeg'),
  (200026, 'Summer Shorts', 49.50, 'Collection · women', 'https://images.pexels.com/photos/1375849/pexels-photo-1375849.jpeg'),
  (200027, 'Polka Dot Blouse', 81.00, 'Collection · women', 'https://images.pexels.com/photos/2825577/pexels-photo-2825577.jpeg'),
  (200028, 'Kids Party Dress', 90.00, 'Collection · kids', 'https://images.pexels.com/photos/7100302/pexels-photo-7100302.jpeg'),
  (200029, 'Navy Blazer', 225.00, 'Collection · men', 'https://images.pexels.com/photos/27987914/pexels-photo-27987914.jpeg'),
  (200030, 'Embroidered Kurti', 108.00, 'Collection · women', 'https://images.pexels.com/photos/19248045/pexels-photo-19248045.jpeg')
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  category = excluded.category,
  image = excluded.image;

select setval(
  pg_get_serial_sequence('public.products', 'id'),
  greatest(coalesce((select max(id) from public.products), 1), 1),
  true
);
