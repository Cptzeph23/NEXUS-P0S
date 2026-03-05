"use client";

import { useState, useEffect } from "react";
import { searchCustomers, createCustomer } from "@/lib/customers";
import type { Customer } from "@/types";
import { fmt } from "@/lib/utils";

interface CustomerSearchProps {
  tenantId: string;
  onSelect: (customer: Customer | null) => void;
  selectedCustomer: Customer | null;
}

export function CustomerSearch({
  tenantId,
  onSelect,
  selectedCustomer,
}: CustomerSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    async function search() {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      const customers = await searchCustomers(query);
      setResults(customers);
      setShowResults(true);
    }

    const timeout = setTimeout(search, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  async function handleCreateCustomer() {
    if (!newCustomer.name.trim()) {
      alert("Customer name is required");
      return;
    }

    setIsCreating(true);
    try {
      const customer = await createCustomer(tenantId, {
        name: newCustomer.name.trim(),
        email: newCustomer.email.trim() || undefined,
        phone: newCustomer.phone.trim() || undefined,
      });

      onSelect(customer);
      setShowCreate(false);
      setNewCustomer({ name: "", email: "", phone: "" });
      setQuery("");
    } catch (error) {
      console.error("Failed to create customer:", error);
      alert("Failed to create customer");
    } finally {
      setIsCreating(false);
    }
  }

  if (selectedCustomer) {
    return (
      <div
        className="flex items-center justify-between p-3 rounded-lg mb-3"
        style={{
          backgroundColor: "#1f1040",
          border: "1px solid #7c3aed",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
            style={{ backgroundColor: "#7c3aed", color: "#ffffff" }}
          >
            {selectedCustomer.name.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: "#e0d8f8" }}>
              {selectedCustomer.name}
            </div>
            <div className="text-xs" style={{ color: "#a78bfa" }}>
              {selectedCustomer.loyaltyPoints} points • {selectedCustomer.totalVisits} visits
            </div>
          </div>
        </div>
        <button
          onClick={() => onSelect(null)}
          className="text-xs px-3 py-1.5 rounded-lg"
          style={{
            backgroundColor: "#1a0d0d",
            border: "1px solid #7f1d1d",
            color: "#fca5a5",
          }}
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="mb-3 relative">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
          placeholder="Search customer (name, email, phone)..."
          className="flex-1 px-3 py-2 rounded-lg text-sm"
          style={{
            backgroundColor: "#0f0f1c",
            border: "1px solid #2a2a3f",
            color: "#c8c0e0",
          }}
        />
        <button
          onClick={() => setShowCreate(true)}
          className="px-3 py-2 rounded-lg text-xs font-semibold"
          style={{
            backgroundColor: "#1f1040",
            border: "1px solid #7c3aed",
            color: "#a78bfa",
          }}
        >
          + New
        </button>
      </div>

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-10"
          style={{
            backgroundColor: "#0d0d1a",
            border: "1px solid #2a2a3f",
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {results.map((customer) => (
            <button
              key={customer.id}
              onClick={() => {
                onSelect(customer);
                setShowResults(false);
                setQuery("");
              }}
              className="w-full text-left p-3 transition-colors"
              style={{
                borderBottom: "1px solid #14141f",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#1a1a28")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <div className="font-semibold text-sm" style={{ color: "#e0d8f8" }}>
                {customer.name}
              </div>
              <div className="text-xs mt-1" style={{ color: "#6b6b8a" }}>
                {customer.email || customer.phone || "No contact info"}
                {" • "}
                {customer.loyaltyPoints} pts
                {" • "}
                {fmt(customer.totalSpent)} spent
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Create Customer Modal */}
      {showCreate && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.8)", zIndex: 100 }}
        >
          <div
            className="w-full max-w-md p-6 rounded-2xl"
            style={{
              backgroundColor: "#0d0d1a",
              border: "1px solid #3b1f6e",
            }}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: "#e0d8f8" }}>
              New Customer
            </h3>

            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#9f9fbe" }}>
                  Name *
                </label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: "#14141f",
                    border: "1px solid #2a2a3f",
                    color: "#e0d8f8",
                  }}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#9f9fbe" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, email: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: "#14141f",
                    border: "1px solid #2a2a3f",
                    color: "#e0d8f8",
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#9f9fbe" }}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: "#14141f",
                    border: "1px solid #2a2a3f",
                    color: "#e0d8f8",
                  }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowCreate(false);
                  setNewCustomer({ name: "", email: "", phone: "" });
                }}
                className="flex-1 py-2 rounded-lg font-semibold"
                style={{
                  backgroundColor: "#1a0d0d",
                  border: "1px solid #7f1d1d",
                  color: "#fca5a5",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomer}
                disabled={isCreating || !newCustomer.name.trim()}
                className="flex-1 py-2 rounded-lg font-semibold"
                style={{
                  backgroundColor:
                    isCreating || !newCustomer.name.trim() ? "#5520b0" : "#7c3aed",
                  color: "#ffffff",
                }}
              >
                {isCreating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}