import { useEffect, useMemo, useRef, useState } from "react";

type Option = {
  id: string | number;
  name?: string;
  email?: string;
  empId?: string | number | null;
  label: string;
};

interface AssignToAutocompleteProps {
  value?: Option | null;
  onChange?: (opt: Option | null) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  inputClassName?: string;
  containerClassName?: string;
  /** start searching after N chars */
  minChars?: number;
  /** show list on focus (using empty query) */
  showOnFocus?: boolean;
}

export default function AssignToAutocomplete({
  value,
  onChange,
  disabled = false,
  label,
  placeholder = "Type name, email, or EmpID",
  inputClassName = "w-full rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400",
  containerClassName = "w-full",
  minChars = 1,
  showOnFocus = true,
}: AssignToAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState<string>(value?.label || value?.name || "");
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [err, setErr] = useState<string>("");
  const rootRef = useRef<HTMLDivElement | null>(null);

  const API_BASE =
    (import.meta as any)?.env?.VITE_API_BASE_URL?.replace(/\/$/, "") || "";

  const getToken = (): string =>
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    "";

  const fetchUsers = async (q: string): Promise<void> => {
    setErr("");

    // respect minChars unless showOnFocus is true
    if (!q && !showOnFocus) return;
    if ((q || "").length < minChars && q !== "") return;

    const token = getToken();
    if (!token) {
      setErr("No token found. Please sign in.");
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const url = `${API_BASE}/api/users/suggest?q=${encodeURIComponent(
        q || ""
      )}&limit=10`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      if (res.status === 401 || res.status === 403) {
        setErr(`Unauthorized (${res.status}).`);
        setOptions([]);
        return;
      }
      if (!res.ok) {
        setErr(`Error ${res.status}`);
        setOptions([]);
        return;
      }

      const json = (await res.json()) as {
        data?: Array<{
          _id?: string;
          id?: string | number;
          name?: string;
          email?: string;
          empId?: string | number | null;
          label?: string;
        }>;
      };

      const data = Array.isArray(json?.data) ? json.data : [];

      const normalized: Option[] = data
        .map((u) => {
          const id = u.id ?? u._id;
          const label =
            u.label ??
            (u.empId ? `${u.name ?? ""} (${u.empId})` : u.name ?? u.email ?? "");
      
          if (!id || !label) return null;
      
          return {
            id,
            name: u.name,
            email: u.email,
            empId: u.empId ?? null,
            label,
          } as Option;
        })
        .filter((o): o is Option => o !== null);
      setOptions(normalized);
    } catch {
      setErr("Network error");
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  // generic debounce helper
  function debounce<T extends (...args: any[]) => void>(fn: T, ms = 300) {
    let t: ReturnType<typeof setTimeout> | undefined;
    return (...args: Parameters<T>) => {
      if (t) clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  const debouncedFetch = useMemo(
    () => debounce((q: string) => void fetchUsers(q), 350),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // outside click closes menu
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const node = e.target as Node;
      if (rootRef.current && !rootRef.current.contains(node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // reflect external value
  useEffect(() => {
    if (value) setInput(value.label || value.name || "");
  }, [value]);

  const selectOption = (opt: Option | null) => {
    onChange?.(opt);
    setInput(opt?.label || "");
    setOpen(false);
  };

  const clearSelection = () => {
    onChange?.(null);
    setInput("");
    setOptions([]);
    setActiveIndex(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && activeIndex >= 0 && activeIndex < options.length) {
        e.preventDefault();
        selectOption(options[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className={containerClassName} ref={rootRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          autoComplete="off"
          className={inputClassName}
          placeholder={placeholder}
          value={input}
          disabled={disabled}
          onChange={(e) => {
            const v = e.target.value;
            setInput(v);
            setOpen(true);
            setActiveIndex(-1);
            debouncedFetch(v);
          }}
          onFocus={() => {
            setOpen(true);
            if (showOnFocus) debouncedFetch(""); // load initial list
            else if (input && input.length >= minChars) debouncedFetch(input);
          }}
          onKeyDown={onKeyDown}
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls="assignTo-listbox"
          role="combobox"
        />

        {/* right adornments */}
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-2">
          {loading && (
            <span className="pointer-events-auto h-4 w-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {input && !loading && (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute inset-y-0 right-9 my-auto h-7 w-7 grid place-items-center rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            aria-label="Clear selection"
            title="Clear"
          >
            ×
          </button>
        )}

        {open && (
          <ul
            id="assignTo-listbox"
            role="listbox"
            className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto"
          >
            {err ? (
              <li className="px-3 py-2 text-sm text-red-600">{err}</li>
            ) : options.length === 0 && !loading ? (
              <li className="px-3 py-2 text-sm text-gray-500">No results</li>
            ) : (
              options.map((opt, idx) => (
                <li
                  key={`${opt.id}`}
                  role="option"
                  aria-selected={idx === activeIndex}
                  className={`px-3 py-2 cursor-pointer hover:bg-pink-50 ${
                    idx === activeIndex ? "bg-pink-100" : ""
                  }`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectOption(opt)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {opt.label}
                    </span>
                    {opt.email && (
                      <span className="text-xs text-gray-500">{opt.email}</span>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {value && (
        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-sm">
          <span>{value.label}</span>
          {!!value.empId && (
            <span className="text-gray-500">• EmpID {value.empId}</span>
          )}
          <button
            className="ml-1 text-pink-600 hover:underline"
            onClick={clearSelection}
            type="button"
          >
            clear
          </button>
        </div>
      )}
    </div>
  );
}