import React from "react";

export default function Basket({
  basket,
  removeItem,
  total
}) {
  return (
    <div className="mt-6 bg-white p-4 rounded-xl shadow">

      <div className="font-bold mb-2">Basket</div>

      {basket.map((i) => (
        <div
          key={i.id}
          className="flex justify-between border-b py-2"
        >
          <div>
            {i.name} x{i.qty}
          </div>

          <div className="flex gap-3">
            £{(i.retail_cost * i.qty).toFixed(2)}

            <button
              onClick={() => removeItem(i.id)}
              className="text-red-500"
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <div className="font-bold mt-3">
        Total: £{total.toFixed(2)}
      </div>
    </div>
  );
}