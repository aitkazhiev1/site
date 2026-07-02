/**
 * Hand-written stand-in for `supabase gen types typescript`.
 * Once a real Supabase project exists, regenerate with:
 *   npx supabase gen types typescript --project-id <id> > types/database.ts
 * and keep this file's shape in sync with supabase/migrations/.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "customer" | "admin";
export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: UserRole;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          role?: UserRole;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: UserRole;
        };
        Relationships: [];
      };
      barbers: {
        Row: {
          id: string;
          name: string;
          bio: string | null;
          avatar_url: string | null;
          specialties: string[];
          active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          bio?: string | null;
          avatar_url?: string | null;
          specialties?: string[];
          active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          bio?: string | null;
          avatar_url?: string | null;
          specialties?: string[];
          active?: boolean;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          duration_min: number;
          price: number;
          active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          duration_min: number;
          price: number;
          active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          duration_min?: number;
          price?: number;
          active?: boolean;
        };
        Relationships: [];
      };
      barber_services: {
        Row: {
          barber_id: string;
          service_id: string;
        };
        Insert: {
          barber_id: string;
          service_id: string;
        };
        Update: {
          barber_id?: string;
          service_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "barber_services_barber_id_fkey";
            columns: ["barber_id"];
            isOneToOne: false;
            referencedRelation: "barbers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "barber_services_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      working_hours: {
        Row: {
          id: string;
          barber_id: string;
          weekday: number;
          start_time: string;
          end_time: string;
        };
        Insert: {
          id?: string;
          barber_id: string;
          weekday: number;
          start_time: string;
          end_time: string;
        };
        Update: {
          id?: string;
          barber_id?: string;
          weekday?: number;
          start_time?: string;
          end_time?: string;
        };
        Relationships: [
          {
            foreignKeyName: "working_hours_barber_id_fkey";
            columns: ["barber_id"];
            isOneToOne: false;
            referencedRelation: "barbers";
            referencedColumns: ["id"];
          },
        ];
      };
      time_off: {
        Row: {
          id: string;
          barber_id: string;
          start_at: string;
          end_at: string;
          reason: string | null;
        };
        Insert: {
          id?: string;
          barber_id: string;
          start_at: string;
          end_at: string;
          reason?: string | null;
        };
        Update: {
          id?: string;
          barber_id?: string;
          start_at?: string;
          end_at?: string;
          reason?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "time_off_barber_id_fkey";
            columns: ["barber_id"];
            isOneToOne: false;
            referencedRelation: "barbers";
            referencedColumns: ["id"];
          },
        ];
      };
      appointments: {
        Row: {
          id: string;
          barber_id: string;
          service_id: string;
          customer_id: string;
          start_at: string;
          end_at: string;
          status: AppointmentStatus;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          barber_id: string;
          service_id: string;
          customer_id: string;
          start_at: string;
          end_at: string;
          status?: AppointmentStatus;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          barber_id?: string;
          service_id?: string;
          customer_id?: string;
          start_at?: string;
          end_at?: string;
          status?: AppointmentStatus;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_barber_id_fkey";
            columns: ["barber_id"];
            isOneToOne: false;
            referencedRelation: "barbers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      get_available_slots: {
        Args: {
          p_barber_id: string;
          p_service_id: string;
          p_date: string;
        };
        Returns: {
          slot_start: string;
          slot_end: string;
        }[];
      };
    };
    Enums: {
      user_role: UserRole;
      appointment_status: AppointmentStatus;
    };
  };
}
