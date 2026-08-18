import { ProductForm } from "../product-form";
import { createProduct } from "../actions";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-maroon">Add Product</h1>
      <ProductForm action={createProduct} />
    </div>
  );
}
