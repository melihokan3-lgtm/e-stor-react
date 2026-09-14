insert into public.products (title, price, description, category, image)
values
  ('Fresh Milk', 3.49, 'Fresh whole milk for everyday use.', 'Dairy', '/img/milk1.png'),
  ('Organic Milk', 4.29, 'Creamy organic milk.', 'Dairy', '/img/milk2.png'),
  ('Farm Eggs', 5.99, 'Fresh farm eggs.', 'Eggs', '/img/egg1.png'),
  ('Free Range Eggs', 6.49, 'Free range eggs from local farms.', 'Eggs', '/img/egg2.png'),
  ('Cheddar Cheese', 7.99, 'Rich and delicious cheddar cheese.', 'Cheese', '/img/cheese1.png'),
  ('Fresh Cheese', 6.99, 'Soft cheese for breakfast and snacks.', 'Cheese', '/img/cheese2.png'),
  ('Daily Essentials', 8.49, 'A practical grocery essential.', 'Grocery', '/img/image 1.png'),
  ('Healthy Choice', 9.99, 'A quality choice for your kitchen.', 'Grocery', '/img/image 2.png')
on conflict do nothing;
