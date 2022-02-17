import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import 'tailwindcss/tailwind.css';
import { listProducts } from '../lib/fauna';

const PRODUCTS_PATH = '/api/products';

const putProduct = async (payload) => {
  return fetch(PRODUCTS_PATH, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => {
    return res.ok ? res.json() : Promise.reject(res);
  });
};

const useProductsFlow = ({ initialProducts }) => {
  const { data: products } = useSWR(PRODUCTS_PATH, {
    initialData: initialProducts,
  });

  // Perform POST request to Fauna with the passed in values
  const onSubmit = async (payload) => {
    await putProduct(payload);
    await mutate(PRODUCTS_PATH);
  };

  return {
    products,
    onSubmit
  };
};

const AddProductForm = ({ onSubmit: onSubmitProp }) => {
  const initial = {
    title: '',
    quantity: 0,
  };
  const [values, setValues] = useState(initial);
  const [formState, setFormState] = useState('initial');
  const isSubmitting = formState === 'submitting';

  // Handling the submit of our form.
  const onSubmit = (ev) => {
    ev.preventDefault();

    setFormState('submitting');
    // Submit the form using the function declared in useProductsFlow
    onSubmitProp(values)
      .then(() => {
        setValues(initial);
        setFormState('submitted');
      })
      .catch(() => {
        setFormState('failed');
      });
  };

  // On change, update the state for the form values.
  const makeOnChange = (fieldName) => {
    return ({ target: { value, valueAsNumber } }) => {
      if (fieldName === 'quantity') {
        return setValues({
          ...values,
          [fieldName]: valueAsNumber,
        });
      }
      return setValues({
        ...values,
        [fieldName]: value,
      });
    };
  };

  const inputClasses =
    ' border block p-2 bg-white dark:bg-gray-800 rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100';

  return (
    <form className="flex flex-col justify-start text-xl" onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <label htmlFor="title">Product Title</label>
        <input
          required
          className={inputClasses}
          type="text"
          name="title"
          id="title"
          value={values.title}
          onChange={makeOnChange('title')}
        />
      </div>
      <div className="flex flex-col gap-4 mt-6">
        <label htmlFor="quantity"> Product Quantity</label>
        <input
          required
          className={inputClasses}
          type="number"
          name="quantity"
          id="quantity"
          value={values.quantity}
          onChange={makeOnChange('quantity')}
        />
      </div>
      <button
        className="bg-blue-200 mt-6 p-4 max-w-xs rounded-lg"
        type="submit"
        disabled={isSubmitting}
      >
        Add Product
      </button>
    </form>
  );
};

const Products = ({ initialProducts }) => {
  // Bring in the products to display and functions used to update the data.
  const { products, onSubmit, updateProduct } = useProductsFlow({
    initialProducts,
  });

  return (
    <main className="max-w-4xl mx-auto p-4 text-left flex-col">
      <div>
        <h1 className="text-4xl mb-6">Products</h1>
        <div className="flex flex-wrap gap-x-10 gap-y-5 justify-start">
          {products?.map(({ title, quantity, _id }) => {
            return (
              <div
                key={_id}
                className="bg-blue-200 p-6 min-w-[20%] text-center"
              >
                <h2 className="font-bold text-xl">{title}</h2>
                <p>Stock: {quantity}</p>
                <div className="flex rounded-sm justify-evenly width-full mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      return onSubmit({
                        id: _id,
                        quantity: quantity + 1,
                        title,
                      });
                    }}
                    className="px-2 bg-white rounded-lg"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      return onSubmit({
                        id: _id,
                        quantity: quantity - 1,
                        title,
                      });
                    }}
                    className={`px-2 bg-white rounded-lg ${quantity === 0 ? 'opacity-60' : ''}`}
                    disabled={quantity === 0}
                  >
                    -
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <h2 className="text-2xl mt-10 mb-6">Add a New Product</h2>
        <AddProductForm onSubmit={onSubmit} />
      </div>
    </main>
  );
};

export const getStaticProps = async () => {
  return {
    props: {
      initialProducts: await listProducts(),
    },
    revalidate: 1,
  };
};

export default Products;
