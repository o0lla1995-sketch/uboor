export interface UserProfile {
  id: string;
  id_number: string;
  full_name: string;
  phone_number: string;
  has_passport: boolean;
  passport_status: 'valid' | 'expired' | 'none';
  identity_card_image_url: string | null;
  passport_image_url: string | null;
  telegram_chat_id: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  user_id: string;
  full_name: string;
  id_number: string | null;
  birth_date: string;
  has_passport: boolean;
  passport_status: 'valid' | 'expired' | 'none';
  identity_card_image_url: string | null;
  passport_image_url: string | null;
  is_underage: boolean;
  created_at: string;
  updated_at: string;
}

export interface PassportOrder {
  id: string;
  user_id: string;
  target_type: 'main_user' | 'family_member';
  target_id: string;
  order_status: 'pending' | 'processing' | 'completed' | 'rejected';
  usdt_txid: string;
  payment_status: 'under_review' | 'approved' | 'declined';
  amount: number;
  expected_delivery_date: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}
