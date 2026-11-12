-- ==============================================================================
-- WebPilot AI — Creación / Activación del Usuario Demo en Supabase Auth
-- Email: demo@darador.com
-- Rol: DEMO (Solo Lectura)
-- ==============================================================================

-- 1. Si preferís crearlo directamente con SQL en el SQL Editor de Supabase:
--    (Copia y ejecuta este bloque reemplazando 'TU_PASSWORD_AQUI' por la clave deseada)

DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
  user_exists boolean;
BEGIN
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'demo@darador.com') INTO user_exists;
  
  IF NOT user_exists THEN
    -- Insertar en auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      'demo@darador.com',
      crypt('webpilot2026', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"role":"DEMO","name":"Usuario Demostración"}'::jsonb,
      now(),
      now(),
      '',
      ''
    );

    -- Insertar identidad requerida por Supabase GoTrue
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      new_user_id,
      new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', 'demo@darador.com'),
      'email',
      'demo@darador.com',
      now(),
      now(),
      now()
    );
    
    RAISE NOTICE 'Usuario demo@darador.com creado exitosamente.';
  ELSE
    -- Si ya existía, asegurarse de que tenga la contraseña y el rol DEMO
    UPDATE auth.users
    SET 
      encrypted_password = crypt('webpilot2026', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"DEMO"')
    WHERE email = 'demo@darador.com';

    RAISE NOTICE 'Usuario demo@darador.com actualizado con rol DEMO.';
  END IF;
END $$;
