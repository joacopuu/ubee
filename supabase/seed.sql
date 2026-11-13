-- Contenido inicial de UBEE (generado por scripts/gen-seed.ts). Se puede ejecutar más de una vez.
insert into public.services (id, category, name, description, duration, price, signature, active, sort) values
  ('sunkiss', 'color', 'Sunkiss', 'Mechas suaves y naturales. Aclara hasta dos tonos, sin decoloración y sin amoníaco.', 150, 95000, true, true, 0),
  ('free-hands-balayage', 'color', 'Free Hands Balayage', 'Aclaración a mano alzada, sin papel ni bandas térmicas. Contraste suave y crecimiento natural.', 210, 140000, true, true, 1),
  ('blonde-ice', 'color', 'Blonde Ice', 'Rubio extra claro, frío y luminoso, con un efecto perlado que se acerca al blanco.', 240, 165000, true, true, 2),
  ('french-blending', 'color', 'French Blending', 'Rubios luminosos que conviven con tus canas, con una transición suave y un crecimiento prolijo.', 180, 130000, true, true, 3),
  ('color-autor', 'color', 'Color de autor', 'Diagnóstico y color a medida: global, reflejos o corrección de color.', 120, 72000, false, true, 4),
  ('retoque-raiz', 'color', 'Retoque de raíz', 'Mantenimiento de color en el crecimiento, con matiz incluido.', 90, 48000, false, true, 5),
  ('corte-personalizado', 'corte', 'Corte personalizado', 'Asesoramiento según tu rostro y textura, lavado y terminación.', 60, 28000, false, true, 6),
  ('long-bob', 'corte', 'Long bob desfilado', 'Puntas suavemente desfiladas que le dan movimiento a cada onda.', 60, 30000, false, true, 7),
  ('corte-masculino', 'corte', 'Corte masculino', 'Corte, perfilado y styling.', 45, 20000, false, true, 8),
  ('blowout', 'peinado', 'Blowout', 'El volumen de los 90: raíces con cuerpo, ondas suaves y puntas con movimiento.', 60, 26000, true, true, 9),
  ('brushing', 'peinado', 'Brushing', 'Lavado y brushing con terminación lisa o con movimiento.', 45, 18000, false, true, 10),
  ('peinado-evento', 'peinado', 'Peinado de evento', 'Ondas con aire de los 70 y los 90, recogidos y looks para fiestas o novias.', 90, 45000, false, true, 11),
  ('nutricion', 'tratamiento', 'Nutrición profunda', 'Hidratación intensiva con ampolla y sellado de cutícula.', 45, 25000, false, true, 12),
  ('reconstruccion', 'tratamiento', 'Reconstrucción post-color', 'Repara la fibra después de aclaraciones y decoloraciones.', 60, 35000, false, true, 13),
  ('alisado', 'tratamiento', 'Alisado orgánico', 'Reduce el frizz y alisa sin formol. Incluye diagnóstico previo.', 180, 110000, false, true, 14)
on conflict (id) do update set category = excluded.category, name = excluded.name, description = excluded.description, duration = excluded.duration, price = excluded.price, signature = excluded.signature, active = excluded.active, sort = excluded.sort;

insert into public.products (id, name, line, category, size, price, image, note, active, sort) values
  ('shampoo-matizador', 'Shampoo matizador', 'Rubios', 'Rubios', '300 ml', 24500, 'https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=900&q=78&auto=format&fit=crop', 'Neutraliza tonos amarillos. Ideal después de Blonde Ice.', true, 0),
  ('mascara-perla', 'Máscara perla', 'Rubios', 'Rubios', '250 ml', 31800, 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=900&q=78&auto=format&fit=crop', 'Matiza y nutre en una sola pasada.', true, 1),
  ('shampoo-hidratante', 'Shampoo hidratante', 'Hidratación', 'Hidratación', '300 ml', 21900, 'https://images.unsplash.com/photo-1786725009844-3daea6bd1fb0?w=900&q=78&auto=format&fit=crop', 'Limpieza suave para uso diario.', true, 2),
  ('acondicionador-nutritivo', 'Acondicionador nutritivo', 'Hidratación', 'Hidratación', '300 ml', 22900, 'https://images.unsplash.com/photo-1760895535234-2c39c57cf187?w=900&q=78&auto=format&fit=crop', 'Desenreda y deja el cabello liviano.', true, 3),
  ('aceite-puntas', 'Aceite de puntas', 'Reparación', 'Reparación', '50 ml', 27400, 'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=900&q=78&auto=format&fit=crop', 'Sella puntas abiertas y suma brillo.', true, 4),
  ('reconstructor', 'Tratamiento reconstructor', 'Reparación', 'Reparación', '200 ml', 36500, 'https://images.unsplash.com/photo-1786737554096-4b22c03ad991?w=900&q=78&auto=format&fit=crop', 'Para cabellos aclarados o decolorados.', true, 5),
  ('protector-termico', 'Protector térmico', 'Styling', 'Styling', '200 ml', 19800, 'https://images.unsplash.com/photo-1780952934157-f541e70c7ece?w=900&q=78&auto=format&fit=crop', 'Protege hasta 230 °C. Antes de planchita o buclera.', true, 6),
  ('kit-cepillos', 'Kit de cepillos', 'Herramientas', 'Herramientas', '3 piezas', 42000, 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=900&q=78&auto=format&fit=crop', 'Los mismos que usamos para el blowout.', true, 7)
on conflict (id) do update set name = excluded.name, line = excluded.line, category = excluded.category, size = excluded.size, price = excluded.price, image = excluded.image, note = excluded.note, active = excluded.active, sort = excluded.sort;

insert into public.news (id, type, title, text, date, image, cta_label, cta_href, members, published) values
  ('workshop-balayage', 'workshop', 'Workshop de Balayage francés', 'Formación intensiva para profesionales: aclaración a mano alzada, diagnóstico y matización. Cupos limitados.', '2026-11-28', 'https://images.unsplash.com/photo-1629397685944-7073f5589754?w=1400&q=78&auto=format&fit=crop', 'Consultar cupos', 'wa:cordoba:Hola! Quiero consultar por el Workshop de Balayage.', false, true),
  ('beneficio-martes', 'beneficio', 'Martes de tratamiento', 'Miembros del Club: 20% en Nutrición profunda todos los martes, en las dos sucursales.', '2026-11-10', 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=1400&q=78&auto=format&fit=crop', 'Reservar un martes', '/reservar?servicio=nutricion', true, true),
  ('sunkiss', 'novedad', 'Llegó Sunkiss', 'Luz sin decoloración ni amoníaco: hasta dos tonos más claro, conservando profundidad.', '2026-11-07', 'https://images.unsplash.com/photo-1605980625458-21e4d9c29c4c?w=1400&q=78&auto=format&fit=crop', 'Reservar Sunkiss', '/reservar?servicio=sunkiss', false, true),
  ('ultimo-momento', 'oportunidad', 'Turnos de último momento', 'Cada semana liberamos turnos con precio especial. Se publican primero en el canal del Club.', '2026-11-05', 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=1400&q=78&auto=format&fit=crop', 'Unirme al canal', 'club', true, true),
  ('cumple', 'beneficio', 'Tu cumpleaños, en UBEE', 'Brushing de regalo en la semana de tu cumpleaños con cualquier servicio de color.', '2026-11-01', 'https://images.unsplash.com/photo-1497433550656-7fb185be365e?w=1400&q=78&auto=format&fit=crop', 'Ver servicios de color', '/#servicios', true, true),
  ('buscamos', 'novedad', 'En UBEE estamos creciendo', 'Buscamos peluqueros y peluqueras para nuestro equipo. Mandá tu CV por mail a la sucursal que prefieras.', '2026-11-01', 'https://images.unsplash.com/photo-1626379501846-0df4067b8bb9?w=1400&q=78&auto=format&fit=crop', 'Enviar CV', 'mailto:ubee.cba@gmail.com?subject=CV%20-%20Quiero%20trabajar%20en%20UBEE', false, true)
on conflict (id) do update set type = excluded.type, title = excluded.title, text = excluded.text, date = excluded.date, image = excluded.image, cta_label = excluded.cta_label, cta_href = excluded.cta_href, members = excluded.members, published = excluded.published;
