import { listProducts, createProduct, updateProduct } from '../../lib/fauna';

export default async function handler(req, res) {
  const handlers = {
    // If a GET request, return all products
    GET: async () => {
      const entries = await listProducts();

      res.json(entries);
    },

    POST: async () => {
      // If a POST request try to update the product.
      const {
        body: { title, quantity, id },
      } = req;

      try {
        const updated = await updateProduct(id, {
          title,
          quantity,
        });

        res.json(updated);
        // If updating fails, then create a new product
      } catch (e) {
        const created = await createProduct({
          title,
          quantity,
        });

        res.json(created);
      }
    },
  };

  // If not a GET or POST request then return
  if (!handlers[req.method]) {
    return res.status(405).end();
  }

  await handlers[req.method]();
}
