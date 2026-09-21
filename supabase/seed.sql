insert into public.products (title, price, description, category, image)
values
  ('Fresh Milk', 3.49, 'Fresh whole milk for everyday use.', 'Dairy', '/img/optimized/milk1.webp'),
  ('Organic Milk', 4.29, 'Creamy organic milk.', 'Dairy', '/img/optimized/milk2.webp'),
  ('Farm Eggs', 5.99, 'Fresh farm eggs.', 'Eggs', '/img/optimized/egg1.webp'),
  ('Free Range Eggs', 6.49, 'Free range eggs from local farms.', 'Eggs', '/img/optimized/egg2.webp'),
  ('Cheddar Cheese', 7.99, 'Rich and delicious cheddar cheese.', 'Cheese', '/img/optimized/cheese1.webp'),
  ('Fresh Cheese', 6.99, 'Soft cheese for breakfast and snacks.', 'Cheese', '/img/optimized/cheese2.webp'),
  ('Daily Essentials', 8.49, 'A practical grocery essential.', 'Grocery', '/img/optimized/image 1.webp'),
  ('Healthy Choice', 9.99, 'A quality choice for your kitchen.', 'Grocery', '/img/optimized/image 2.webp')
on conflict do nothing;
