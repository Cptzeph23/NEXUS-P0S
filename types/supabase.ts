export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          domain: string | null
          plan: string
          settings: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          domain?: string | null
          plan?: string
          settings?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          domain?: string | null
          plan?: string
          settings?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      branches: {
        Row: {
          id: string
          tenant_id: string
          name: string
          code: string
          address: Json | null
          settings: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          code: string
          address?: Json | null
          settings?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          code?: string
          address?: Json | null
          settings?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          tenant_id: string
          barcode: string | null
          sku: string | null
          name: string
          description: string | null
          price: number
          cost: number | null
          tax_rate: number
          category: string | null
          unit: string
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          barcode?: string | null
          sku?: string | null
          name: string
          description?: string | null
          price: number
          cost?: number | null
          tax_rate?: number
          category?: string | null
          unit?: string
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          barcode?: string | null
          sku?: string | null
          name?: string
          description?: string | null
          price?: number
          cost?: number | null
          tax_rate?: number
          category?: string | null
          unit?: string
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      branch_stock: {
        Row: {
          id: string
          branch_id: string
          product_id: string
          quantity: number
          reorder_point: number
          max_stock: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          branch_id: string
          product_id: string
          quantity?: number
          reorder_point?: number
          max_stock?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          branch_id?: string
          product_id?: string
          quantity?: number
          reorder_point?: number
          max_stock?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          tenant_id: string
          branch_id: string | null
          name: string
          email: string
          phone: string | null
          role: string
          pin: string | null
          password_hash: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          branch_id?: string | null
          name: string
          email: string
          phone?: string | null
          role?: string
          pin?: string | null
          password_hash?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          branch_id?: string | null
          name?: string
          email?: string
          phone?: string | null
          role?: string
          pin?: string | null
          password_hash?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}