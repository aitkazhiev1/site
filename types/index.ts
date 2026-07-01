import type { Database } from "./database";

export type { Database, Json, UserRole, AppointmentStatus } from "./database";

type Tables = Database["public"]["Tables"];

export type Profile = Tables["profiles"]["Row"];
export type Barber = Tables["barbers"]["Row"];
export type Service = Tables["services"]["Row"];
export type BarberService = Tables["barber_services"]["Row"];
export type WorkingHours = Tables["working_hours"]["Row"];
export type TimeOff = Tables["time_off"]["Row"];
export type Appointment = Tables["appointments"]["Row"];

export type AvailableSlot =
  Database["public"]["Functions"]["get_available_slots"]["Returns"][number];
