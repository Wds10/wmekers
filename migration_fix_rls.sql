-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Users can create their own transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;

-- Enable RLS (just in case)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow any authenticated user to INSERT a transaction if they are the buyer
CREATE POLICY "Users can create their own transactions"
ON transactions FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

-- Policy 2: Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
ON transactions FOR SELECT
USING (auth.uid() = buyer_id);

-- Policy 3: Admins can view ALL transactions
-- (Assuming admins triggers or role checks are handled via App logic or a separate Admin Policy)
-- Since RLS is additive, we need a policy for Admins to view everything.
-- For simplicity in this setup, if you have a 'profiles' table with 'role', we can check that.
-- But for now, let's allow read access for the buyer, and we will rely on a separate Admin function or policy if needed.
-- Wait, the Admin panel needs to select ALL transactions. 
-- Let's create a policy that allows everything for users with admin role (checked via join or claim if possible, but simpler: public read might be too open).
-- Let's use a subquery to check role:

CREATE POLICY "Admins can view all transactions"
ON transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Note: Ensure 'profiles' has RLS enabled too or is readable by authenticated users for this subquery to work efficiently.
