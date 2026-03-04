"use client";

import { useState } from "react";
import { searchCustomers, createCustomer } from "@/lib/db/customers";
import type { Customer } from "@/types";

interface CustomerModalProps {
  tenantId: string;
  onSelect: (customer: Customer) => void;
  onClose: () => void;
}

export function CustomerModal({ tenantId, onSelect, onClose }: CustomerModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });

  async function handleSearch(searchQuery: string) {
    setQuery(searchQuery);
    
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const customers = await searchCustomers(searchQuery);
      setResults(customers);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleCreate() {
  if (!newCustomer.name.trim()) {
    alert("Customer name is required");
    return;
  }

  try {
    console.log("Creating customer with data:", { ...newCustomer, tenantId });
    
    const customer = await createCustomer({
      name: newCustomer.name.trim(),
      email: newCustomer.email.trim() || undefined,
      phone: newCustomer.phone.trim() || undefined,
      tenantId,
    });
    
    console.log("Customer created:", customer);
    onSelect(customer);
  } catch (error) {
    console.error("Create error:", error);
    alert("Failed to create customer: " + (error as Error).message);
  }
}

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.85)", zIndex: 100 }}
    >
      <div
        className="w-full max-w-lg p-6 rounded-2xl"
        style={{
          backgroundColor: "#0d0d1a",
          border: "1px solid #3b1f6e",
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold" style={{ color: "#e8e0f8" }}>
            {showCreate ? "New Customer" : "Select Customer"}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl"
            style={{ color: "#6b6b8a" }}
          >
            ✕
          </button>
        </div>

        {!showCreate ? (
          <>
            {/* Search */}
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              autoFocus
              className="w-full px-4 py-3 rounded-lg mb-4"
              style={{
                backgroundColor: "#0f0f1c",
                border: "1px solid #2a2a3f",
                color: "#c8c0e0",
              }}
            />

            {/* Results */}
            <div className="max-h-96 overflow-y-auto mb-4">
              {isSearching ? (
                <div className="text-center py-8" style={{ color: "#6b6b8a" }}>
                  Searching...
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-8" style={{ color: "#6b6b8a" }}>
                  {query.length < 2
                    ? "Type to search customers"
                    : "No customers found"}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {results.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => onSelect(customer)}
                      className="p-4 rounded-lg text-left transition-all"
                      style={{
                        backgroundColor: "#0f0f1c",
                        border: "1px solid #2a2a3f",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#7c3aed";
                        e.currentTarget.style.backgroundColor = "#1f1040";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#2a2a3f";
                        e.currentTarget.style.backgroundColor = "#0f0f1c";
                      }}
                    >
                      <div className="font-semibold" style={{ color: "#e0d8f8" }}>
                        {customer.name}
                      </div>
                      <div className="text-xs mt-1" style={{ color: "#6b6b8a" }}>
                        {customer.email || customer.phone || "No contact info"}
                      </div>
                      <div className="flex gap-3 mt-2 text-xs">
                        <span style={{ color: "#a78bfa" }}>
                          {customer.loyaltyPoints} points
                        </span>
                        <span style={{ color: "#6b6b8a" }}>
                          {customer.totalVisits} visits
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Create New Button */}
            <button
              onClick={() => setShowCreate(true)}
              className="w-full py-3 rounded-lg font-semibold"
              style={{
                backgroundColor: "#1f1040",
                border: "1px solid #7c3aed",
                color: "#c4b5fd",
              }}
            >
              + Create New Customer
            </button>
          </>
        ) : (
          <>
            {/* Create Form */}
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: "#c0b8d8" }}>
                  Name *
                </label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg"
                  style={{
                    backgroundColor: "#0f0f1c",
                    border: "1px solid #2a2a3f",
                    color: "#c8c0e0",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: "#c0b8d8" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, email: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg"
                  style={{
                    backgroundColor: "#0f0f1c",
                    border: "1px solid #2a2a3f",
                    color: "#c8c0e0",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: "#c0b8d8" }}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg"
                  style={{
                    backgroundColor: "#0f0f1c",
                    border: "1px solid #2a2a3f",
                    color: "#c8c0e0",
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-3 rounded-lg font-semibold"
                style={{
                  backgroundColor: "#1a0d0d",
                  border: "1px solid #7f1d1d",
                  color: "#fca5a5",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 py-3 rounded-lg font-semibold"
                style={{
                  backgroundColor: "#7c3aed",
                  color: "#ffffff",
                }}
              >
                Create
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}