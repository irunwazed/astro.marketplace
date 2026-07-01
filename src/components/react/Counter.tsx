import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setCount((c) => c - 1)}
        className="rounded-md bg-slate-100 px-3 py-1 text-sm font-medium hover:bg-slate-200"
      >
        -
      </button>
      <span className="w-6 text-center text-sm font-medium">{count}</span>
      <button
        onClick={() => setCount((c) => c + 1)}
        className="rounded-md bg-slate-100 px-3 py-1 text-sm font-medium hover:bg-slate-200"
      >
        +
      </button>
    </div>
  );
}
