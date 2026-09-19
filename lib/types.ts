/** Publisher/pioneer categories the congregation reports against. */
export type Category = 'publisher' | 'regular_pioneer' | 'auxiliary_pioneer' | 'special_pioneer';
export type Role = 'publisher' | 'secretary';

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  role: Role;
  category: Category | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  month_key: string; // "YYYY-MM"
  category: Category;
  participated: boolean | null;
  hours: number | null;
  studies: number | null;
  comment: string | null;
  submitted_at: string;
  edited_by_secretary: string | null;
  edited_at: string | null;
}

/** Typed schema for the Supabase client generic, matching the shape
 *  `@supabase/postgrest-js` needs to resolve narrow `.select('col')`
 *  queries (not just `.select('*')`) — the `Relationships` array and the
 *  sibling `Views`/`Functions`/`Enums`/`CompositeTypes` keys are required
 *  for that type-level parsing to work, even though this app doesn't use
 *  any of them. Regenerate with `supabase gen types typescript` once your
 *  project is live for full type safety on every table/column. */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; full_name: string; username: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      reports: {
        Row: Report;
        Insert: Partial<Report> & { user_id: string; month_key: string; category: Category };
        Update: Partial<Report>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
