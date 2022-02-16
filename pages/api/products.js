import { listProducts, createProduct, updateProduct } from '../../lib/fauna';

export default async function handler(req, res) {
  const handlers = {
    GET: async () => {
      const entries = await listProducts();

      res.json(entries);
    },

    POST: async () => {
      try {
        const {
          body: { title, quantity, id },
        } = req;

        const updated = await updateProduct(id, {
          title,
          quantity,
        });

        res.json(updated);
      } catch (e) {
        const {
          body: { title, quantity },
        } = req;
        const created = await createProduct({
          title,
          quantity,
        });

        res.json(created);
      }
    },
  };

  if (!handlers[req.method]) {
    return res.status(405).end();
  }

  await handlers[req.method]();
}
