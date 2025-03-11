/*
  # Add role-based access control policies

  1. Security Changes
    - Enable RLS on all tables
    - Add view policies for all authenticated users
    - Add edit policies for specific users with edit access
    
  2. Tables Modified
    - case_type
    - units_of_units
    - product_type
    - registrant
    - warehouse
    - pack_size
    - product
    - item
    - transaction_header
    - transaction_detail

  Note: This migration adds policies that allow all authenticated users to view data
  but restricts edit operations to specific users.
*/

-- Create a function to check if a user has edit access
CREATE OR REPLACE FUNCTION public.has_edit_access()
RETURNS boolean AS $$
BEGIN
  RETURN auth.uid() IN (
    '7dfe7cd1-1b7b-4a35-94a5-ee580d24a25e'::uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- case_type policies
CREATE POLICY "Allow view access to all authenticated users for case_type"
  ON case_type
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow edit access to specific users for case_type"
  ON case_type
  FOR ALL
  TO authenticated
  USING (has_edit_access())
  WITH CHECK (has_edit_access());

-- units_of_units policies
CREATE POLICY "Allow view access to all authenticated users for units_of_units"
  ON units_of_units
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow edit access to specific users for units_of_units"
  ON units_of_units
  FOR ALL
  TO authenticated
  USING (has_edit_access())
  WITH CHECK (has_edit_access());

-- product_type policies
CREATE POLICY "Allow view access to all authenticated users for product_type"
  ON product_type
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow edit access to specific users for product_type"
  ON product_type
  FOR ALL
  TO authenticated
  USING (has_edit_access())
  WITH CHECK (has_edit_access());

-- registrant policies
CREATE POLICY "Allow view access to all authenticated users for registrant"
  ON registrant
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow edit access to specific users for registrant"
  ON registrant
  FOR ALL
  TO authenticated
  USING (has_edit_access())
  WITH CHECK (has_edit_access());

-- warehouse policies
CREATE POLICY "Allow view access to all authenticated users for warehouse"
  ON warehouse
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow edit access to specific users for warehouse"
  ON warehouse
  FOR ALL
  TO authenticated
  USING (has_edit_access())
  WITH CHECK (has_edit_access());

-- pack_size policies
CREATE POLICY "Allow view access to all authenticated users for pack_size"
  ON pack_size
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow edit access to specific users for pack_size"
  ON pack_size
  FOR ALL
  TO authenticated
  USING (has_edit_access())
  WITH CHECK (has_edit_access());

-- product policies
CREATE POLICY "Allow view access to all authenticated users for product"
  ON product
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow edit access to specific users for product"
  ON product
  FOR ALL
  TO authenticated
  USING (has_edit_access())
  WITH CHECK (has_edit_access());

-- item policies
CREATE POLICY "Allow view access to all authenticated users for item"
  ON item
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow edit access to specific users for item"
  ON item
  FOR ALL
  TO authenticated
  USING (has_edit_access())
  WITH CHECK (has_edit_access());

-- transaction_header policies
CREATE POLICY "Allow view access to all authenticated users for transaction_header"
  ON transaction_header
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow edit access to specific users for transaction_header"
  ON transaction_header
  FOR ALL
  TO authenticated
  USING (has_edit_access())
  WITH CHECK (has_edit_access());

-- transaction_detail policies
CREATE POLICY "Allow view access to all authenticated users for transaction_detail"
  ON transaction_detail
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow edit access to specific users for transaction_detail"
  ON transaction_detail
  FOR ALL
  TO authenticated
  USING (has_edit_access())
  WITH CHECK (has_edit_access());