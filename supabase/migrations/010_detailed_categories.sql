-- ============================================================
-- Migración 010: Categorías y Subcategorías Detalladas
-- Inserta la nueva taxonomía solicitada por el usuario.
-- ============================================================

DO $$
DECLARE
  v_cat_id UUID;
BEGIN
  -- 1. PELÍCULAS Y CINE
  INSERT INTO public.categories (name, slug) VALUES ('Películas y Cine', 'peliculas-y-cine')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Títulos', 'peliculas-titulos'),
    (v_cat_id, 'Actores / Actrices', 'peliculas-actores'),
    (v_cat_id, 'Directores', 'peliculas-directores'),
    (v_cat_id, 'Guionistas', 'peliculas-guionistas'),
    (v_cat_id, 'Productoras', 'peliculas-productoras'),
    (v_cat_id, 'Estudios cinematográficos', 'peliculas-estudios'),
    (v_cat_id, 'Varios', 'peliculas-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 2. SERIES Y TELEVISIÓN
  INSERT INTO public.categories (name, slug) VALUES ('Series y Televisión', 'series-y-tv')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Títulos', 'series-titulos'),
    (v_cat_id, 'Series', 'series-series'),
    (v_cat_id, 'Programas de TV', 'series-programas'),
    (v_cat_id, 'Actores / Actrices', 'series-actores'),
    (v_cat_id, 'Creadores', 'series-creadores'),
    (v_cat_id, 'Escritores', 'series-escritores'),
    (v_cat_id, 'Plataformas', 'series-plataformas'),
    (v_cat_id, 'Episodios específicos', 'series-episodios'),
    (v_cat_id, 'Varios', 'series-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 3. VIDEOJUEGOS
  INSERT INTO public.categories (name, slug) VALUES ('Videojuegos', 'videojuegos')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Títulos', 'videojuegos-titulos'),
    (v_cat_id, 'Desarrolladoras', 'videojuegos-desarrolladoras'),
    (v_cat_id, 'Personajes', 'videojuegos-personajes'),
    (v_cat_id, 'Bandas sonoras', 'videojuegos-bandas-sonoras'),
    (v_cat_id, 'Mecánicas / Sistemas de juego', 'videojuegos-mecanicas'),
    (v_cat_id, 'Plataformas', 'videojuegos-plataformas'),
    (v_cat_id, 'Varios', 'videojuegos-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 4. MÚSICA
  INSERT INTO public.categories (name, slug) VALUES ('Música', 'musica')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Artistas / Bandas', 'musica-artistas'),
    (v_cat_id, 'Álbumes', 'musica-albumes'),
    (v_cat_id, 'Canciones', 'musica-canciones'),
    (v_cat_id, 'Recitales en vivo', 'musica-recitales'),
    (v_cat_id, 'Compositores', 'musica-compositores'),
    (v_cat_id, 'Productores musicales', 'musica-productores'),
    (v_cat_id, 'Sellos discográficos', 'musica-sellos'),
    (v_cat_id, 'Varios', 'musica-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 5. LIBROS Y LITERATURA
  INSERT INTO public.categories (name, slug) VALUES ('Libros y Literatura', 'libros')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Títulos', 'libros-titulos'),
    (v_cat_id, 'Autores', 'libros-autores'),
    (v_cat_id, 'Editoriales', 'libros-editoriales'),
    (v_cat_id, 'Ilustradores', 'libros-ilustradores'),
    (v_cat_id, 'Traductores', 'libros-traductores'),
    (v_cat_id, 'Narradores (audiolibros)', 'libros-narradores'),
    (v_cat_id, 'Varios', 'libros-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 6. DEPORTES
  INSERT INTO public.categories (name, slug) VALUES ('Deportes', 'deportes')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Nombre del deporte', 'deportes-nombres'),
    (v_cat_id, 'Atletas / Deportistas', 'deportes-atletas'),
    (v_cat_id, 'Equipos / Clubes', 'deportes-equipos'),
    (v_cat_id, 'Entrenadores / Técnicos', 'deportes-entrenadores'),
    (v_cat_id, 'Competiciones / Ligas', 'deportes-competiciones'),
    (v_cat_id, 'Estadios / Sedes', 'deportes-estadios'),
    (v_cat_id, 'Jugadas / Momentos históricos', 'deportes-jugadas'),
    (v_cat_id, 'Varios', 'deportes-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 7. GASTRONOMÍA Y COMIDA
  INSERT INTO public.categories (name, slug) VALUES ('Gastronomía y Comida', 'gastronomia')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Restaurantes', 'gastronomia-restaurantes'),
    (v_cat_id, 'Platos / Recetas', 'gastronomia-platos'),
    (v_cat_id, 'Chefs / Cocineros', 'gastronomia-chefs'),
    (v_cat_id, 'Ingredientes', 'gastronomia-ingredientes'),
    (v_cat_id, 'Utensilios de cocina', 'gastronomia-utensilios'),
    (v_cat_id, 'Bebidas / Vinos / Cervezas', 'gastronomia-bebidas'),
    (v_cat_id, 'Varios', 'gastronomia-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 8. VIAJES Y TURISMO
  INSERT INTO public.categories (name, slug) VALUES ('Viajes y Turismo', 'viajes')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Destinos', 'viajes-destinos'),
    (v_cat_id, 'Roadtrips', 'viajes-roadtrips'),
    (v_cat_id, 'Atracciones / Sitios turísticos', 'viajes-atracciones'),
    (v_cat_id, 'Hoteles / Alojamientos', 'viajes-hoteles'),
    (v_cat_id, 'Aerolíneas / Transporte', 'viajes-transporte'),
    (v_cat_id, 'Guías turísticos / Agencias', 'viajes-guias'),
    (v_cat_id, 'Experiencias', 'viajes-experiencias'),
    (v_cat_id, 'Varios', 'viajes-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 9. TECNOLOGÍA Y SOFTWARE
  INSERT INTO public.categories (name, slug) VALUES ('Tecnología y Software', 'tecnologia')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Aplicaciones / Software', 'tech-apps'),
    (v_cat_id, 'Dispositivos / Hardware', 'tech-hardware'),
    (v_cat_id, 'Sistemas operativos', 'tech-os'),
    (v_cat_id, 'Lenguajes de programación', 'tech-lenguajes'),
    (v_cat_id, 'Frameworks / Librerías', 'tech-frameworks'),
    (v_cat_id, 'Empresas tecnológicas', 'tech-empresas'),
    (v_cat_id, 'Gurúes', 'tech-gurues'),
    (v_cat_id, 'Varios', 'tech-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 10. CIENCIA Y EDUCACIÓN
  INSERT INTO public.categories (name, slug) VALUES ('Ciencia y Educación', 'ciencia')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Teorías / Conceptos', 'ciencia-teorias'),
    (v_cat_id, 'Científicos / Investigadores', 'ciencia-cientificos'),
    (v_cat_id, 'Universidades / Institutos', 'ciencia-universidades'),
    (v_cat_id, 'Descubrimientos / Inventos', 'ciencia-descubrimientos'),
    (v_cat_id, 'Publicaciones científicas', 'ciencia-publicaciones'),
    (v_cat_id, 'Metodologías de estudio', 'ciencia-metodologias'),
    (v_cat_id, 'Jardín / Guardería', 'ciencia-jardin'),
    (v_cat_id, 'Primario / ESO', 'ciencia-primario'),
    (v_cat_id, 'Secundarios / Bachilleratos', 'ciencia-secundarios'),
    (v_cat_id, 'Centros de formación', 'ciencia-centros'),
    (v_cat_id, 'Carreras', 'ciencia-carreras'),
    (v_cat_id, 'Cursos', 'ciencia-cursos'),
    (v_cat_id, 'Terciarios', 'ciencia-terciarios'),
    (v_cat_id, 'Varios', 'ciencia-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 11. NEGOCIOS Y EMPRENDIMIENTO
  INSERT INTO public.categories (name, slug) VALUES ('Negocios y Emprendimiento', 'negocios')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Empresas / Startups', 'negocios-empresas'),
    (v_cat_id, 'CEOs / Fundadores', 'negocios-ceos'),
    (v_cat_id, 'Productos / Servicios', 'negocios-productos'),
    (v_cat_id, 'Estrategias de marketing', 'negocios-estrategias'),
    (v_cat_id, 'Modelos de negocio', 'negocios-modelos'),
    (v_cat_id, 'Inversores', 'negocios-inversores'),
    (v_cat_id, 'Varios', 'negocios-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 12. ARTE Y DISEÑO
  INSERT INTO public.categories (name, slug) VALUES ('Arte y Diseño', 'arte')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Obras / Pinturas', 'arte-obras'),
    (v_cat_id, 'Artistas plásticos', 'arte-artistas'),
    (v_cat_id, 'Museos / Galerías', 'arte-museos'),
    (v_cat_id, 'Técnicas artísticas', 'arte-tecnicas'),
    (v_cat_id, 'Diseñadores gráficos', 'arte-disenadores'),
    (v_cat_id, 'Tipografías / Fuentes', 'arte-tipografias'),
    (v_cat_id, 'Varios', 'arte-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 13. MODA Y BELLEZA
  INSERT INTO public.categories (name, slug) VALUES ('Moda y Belleza', 'moda-belleza')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Prendas / Accesorios', 'moda-prendas'),
    (v_cat_id, 'Diseñadores de moda', 'moda-disenadores'),
    (v_cat_id, 'Marcas / Firmas', 'moda-marcas'),
    (v_cat_id, 'Modelos / Influencers', 'moda-modelos'),
    (v_cat_id, 'Maquillaje / Cosméticos', 'moda-maquillaje'),
    (v_cat_id, 'Peinados / Estilistas', 'moda-peinados'),
    (v_cat_id, 'Varios', 'moda-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 14. SALUD Y BIENESTAR
  INSERT INTO public.categories (name, slug) VALUES ('Salud y Bienestar', 'salud')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Enfermedades / Condiciones', 'salud-enfermedades'),
    (v_cat_id, 'Tratamientos / Terapias', 'salud-tratamientos'),
    (v_cat_id, 'Profesionales de la salud', 'salud-profesionales'),
    (v_cat_id, 'Hospitales / Clínicas', 'salud-hospitales'),
    (v_cat_id, 'Suplementos / Vitaminas', 'salud-suplementos'),
    (v_cat_id, 'Rutinas de ejercicio / Yoga', 'salud-rutinas'),
    (v_cat_id, 'Varios', 'salud-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 15. POLÍTICA Y SOCIEDAD
  INSERT INTO public.categories (name, slug) VALUES ('Política y Sociedad', 'politica')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Políticos / Líderes', 'politica-lideres'),
    (v_cat_id, 'Partidos políticos', 'politica-partidos'),
    (v_cat_id, 'Leyes / Políticas públicas', 'politica-leyes'),
    (v_cat_id, 'ONGs / Activistas', 'politica-ongs'),
    (v_cat_id, 'Eventos históricos', 'politica-eventos'),
    (v_cat_id, 'Varios', 'politica-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 16. ECONOMÍA Y FINANZAS
  INSERT INTO public.categories (name, slug) VALUES ('Economía y Finanzas', 'economia')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Indicadores (inflación, PIB)', 'economia-indicadores'),
    (v_cat_id, 'Bancos / Entidades financieras', 'economia-bancos'),
    (v_cat_id, 'Inversiones / Acciones', 'economia-inversiones'),
    (v_cat_id, 'Criptomonedas / Blockchain', 'economia-cripto'),
    (v_cat_id, 'Impuestos', 'economia-impuestos'),
    (v_cat_id, 'Presupuestos personales / Ahorro', 'economia-presupuestos'),
    (v_cat_id, 'Varios', 'economia-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 17. ANIMALES Y MASCOTAS
  INSERT INTO public.categories (name, slug) VALUES ('Animales y Mascotas', 'animales')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Razas de animales', 'animales-razas'),
    (v_cat_id, 'Animales salvajes', 'animales-salvajes'),
    (v_cat_id, 'Veterinarios / Clínicas', 'animales-veterinarios'),
    (v_cat_id, 'Alimentos para mascotas', 'animales-alimentos'),
    (v_cat_id, 'Accesorios / Juguetes', 'animales-accesorios'),
    (v_cat_id, 'Varios', 'animales-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 18. HOGAR Y JARDÍN
  INSERT INTO public.categories (name, slug) VALUES ('Hogar y Jardín', 'hogar')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Muebles / Decoración', 'hogar-muebles'),
    (v_cat_id, 'Electrodomésticos', 'hogar-electrodomesticos'),
    (v_cat_id, 'Herramientas', 'hogar-herramientas'),
    (v_cat_id, 'Plantas / Jardinería', 'hogar-plantas'),
    (v_cat_id, 'Productos de limpieza', 'hogar-limpieza'),
    (v_cat_id, 'Organización / Almacenamiento', 'hogar-organizacion'),
    (v_cat_id, 'Varios', 'hogar-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 19. FAMILIA Y CRIANZA
  INSERT INTO public.categories (name, slug) VALUES ('Familia y Crianza', 'familia')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Métodos de crianza', 'familia-metodos'),
    (v_cat_id, 'Juguetes educativos', 'familia-juguetes'),
    (v_cat_id, 'Libros infantiles', 'familia-libros'),
    (v_cat_id, 'Canales de YouTube para niños', 'familia-canales'),
    (v_cat_id, 'Actividades familiares', 'familia-actividades'),
    (v_cat_id, 'Varios', 'familia-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 20. AUTOMÓVILES Y TRANSPORTE
  INSERT INTO public.categories (name, slug) VALUES ('Automóviles y Transporte', 'autos')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Modelos de autos / Motos', 'autos-modelos'),
    (v_cat_id, 'Marcas / Fabricantes', 'autos-marcas'),
    (v_cat_id, 'Mecánicos / Talleres', 'autos-mecanicos'),
    (v_cat_id, 'Combustibles / Cargadores eléctricos', 'autos-combustibles'),
    (v_cat_id, 'Seguros de auto', 'autos-seguros'),
    (v_cat_id, 'Rutas / Carreteras', 'autos-rutas'),
    (v_cat_id, 'Varios', 'autos-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 21. FOTOGRAFÍA Y VIDEO
  INSERT INTO public.categories (name, slug) VALUES ('Fotografía y Video', 'fotografia')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Cámaras / Lentes', 'fotografia-camaras'),
    (v_cat_id, 'Técnicas de iluminación', 'fotografia-iluminacion'),
    (v_cat_id, 'Software de edición', 'fotografia-software'),
    (v_cat_id, 'Fotógrafos famosos', 'fotografia-fotografos'),
    (v_cat_id, 'Accesorios', 'fotografia-accesorios'),
    (v_cat_id, 'Formatos de archivo', 'fotografia-formatos'),
    (v_cat_id, 'Varios', 'fotografia-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 22. JUEGOS DE MESA Y ROL
  INSERT INTO public.categories (name, slug) VALUES ('Juegos de Mesa y Rol', 'juegos-mesa')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Títulos de juegos', 'juegos-mesa-titulos'),
    (v_cat_id, 'Diseñadores', 'juegos-mesa-disenadores'),
    (v_cat_id, 'Editoriales', 'juegos-mesa-editoriales'),
    (v_cat_id, 'Expansiones', 'juegos-mesa-expansiones'),
    (v_cat_id, 'Componentes (dados, miniaturas)', 'juegos-mesa-componentes'),
    (v_cat_id, 'Mecánicas', 'juegos-mesa-mecanicas'),
    (v_cat_id, 'Varios', 'juegos-mesa-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 23. EVENTOS Y ESPECTÁCULOS
  INSERT INTO public.categories (name, slug) VALUES ('Eventos y Espectáculos', 'eventos')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Conciertos / Festivales', 'eventos-conciertos'),
    (v_cat_id, 'Obras de teatro', 'eventos-teatro'),
    (v_cat_id, 'Stand-up / Comedia', 'eventos-standup'),
    (v_cat_id, 'Exposiciones / Ferias', 'eventos-exposiciones'),
    (v_cat_id, 'Conferencias / Charlas', 'eventos-conferencias'),
    (v_cat_id, 'Deportivos', 'eventos-deportivos'),
    (v_cat_id, 'Varios', 'eventos-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 24. RELIGIÓN Y ESPIRITUALIDAD
  INSERT INTO public.categories (name, slug) VALUES ('Religión y Espiritualidad', 'religion')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Textos sagrados', 'religion-textos'),
    (v_cat_id, 'Líderes religiosos', 'religion-lideres'),
    (v_cat_id, 'Lugares de culto', 'religion-lugares'),
    (v_cat_id, 'Prácticas / Rituales', 'religion-practicas'),
    (v_cat_id, 'Festividades', 'religion-festividades'),
    (v_cat_id, 'Símbolos', 'religion-simbolos'),
    (v_cat_id, 'Varios', 'religion-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 25. HISTORIA
  INSERT INTO public.categories (name, slug) VALUES ('Historia', 'historia')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Personajes históricos', 'historia-personajes'),
    (v_cat_id, 'Batallas / Guerras', 'historia-batallas'),
    (v_cat_id, 'Civilizaciones / Culturas', 'historia-civilizaciones'),
    (v_cat_id, 'Documentos / Tratados', 'historia-documentos'),
    (v_cat_id, 'Inventos / Descubrimientos', 'historia-inventos'),
    (v_cat_id, 'Períodos / Eras', 'historia-periodos'),
    (v_cat_id, 'Varios', 'historia-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 28. MARKETING DIGITAL
  INSERT INTO public.categories (name, slug) VALUES ('Marketing Digital', 'marketing')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Estrategias SEO', 'marketing-seo'),
    (v_cat_id, 'Redes sociales (TikTok, IG, X)', 'marketing-redes'),
    (v_cat_id, 'Email marketing', 'marketing-email'),
    (v_cat_id, 'Anuncios pagados', 'marketing-ads'),
    (v_cat_id, 'Analítica web', 'marketing-analitica'),
    (v_cat_id, 'Copywriting', 'marketing-copywriting'),
    (v_cat_id, 'Varios', 'marketing-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 29. RECURSOS HUMANOS
  INSERT INTO public.categories (name, slug) VALUES ('Recursos Humanos', 'rrhh')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Reclutamiento', 'rrhh-reclutamiento'),
    (v_cat_id, 'Evaluación de desempeño', 'rrhh-evaluacion'),
    (v_cat_id, 'Cultura empresarial', 'rrhh-cultura'),
    (v_cat_id, 'Beneficios / Compensación', 'rrhh-beneficios'),
    (v_cat_id, 'Legislación laboral', 'rrhh-legislacion'),
    (v_cat_id, 'Formación / Desarrollo', 'rrhh-formacion'),
    (v_cat_id, 'Varios', 'rrhh-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 32. ARQUITECTURA Y URBANISMO
  INSERT INTO public.categories (name, slug) VALUES ('Arquitectura y Urbanismo', 'arquitectura')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Edificios / Monumentos', 'arqui-edificios'),
    (v_cat_id, 'Arquitectos', 'arqui-arquitectos'),
    (v_cat_id, 'Materiales de construcción', 'arqui-materiales'),
    (v_cat_id, 'Estilos arquitectónicos', 'arqui-estilos'),
    (v_cat_id, 'Planificación urbana', 'arqui-planificacion'),
    (v_cat_id, 'Espacios públicos', 'arqui-espacios'),
    (v_cat_id, 'Varios', 'arqui-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 33. PSICOLOGÍA Y AUTOAYUDA
  INSERT INTO public.categories (name, slug) VALUES ('Psicología y Autoayuda', 'psicologia')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Terapias / Enfoques', 'psicologia-terapias'),
    (v_cat_id, 'Psicólogos famosos', 'psicologia-psicologos'),
    (v_cat_id, 'Libros de autoayuda', 'psicologia-libros'),
    (v_cat_id, 'Trastornos / Condiciones', 'psicologia-trastornos'),
    (v_cat_id, 'Técnicas de mindfulness', 'psicologia-mindfulness'),
    (v_cat_id, 'Test psicológicos', 'psicologia-tests'),
    (v_cat_id, 'Varios', 'psicologia-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 35. FARMACIA Y MEDICAMENTOS
  INSERT INTO public.categories (name, slug) VALUES ('Farmacia y Medicamentos', 'farmacia')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Medicamentos / Fármacos', 'farmacia-medicamentos'),
    (v_cat_id, 'Laboratorios farmacéuticos', 'farmacia-laboratorios'),
    (v_cat_id, 'Efectos secundarios', 'farmacia-efectos'),
    (v_cat_id, 'Vacunas', 'farmacia-vacunas'),
    (v_cat_id, 'Plantas medicinales', 'farmacia-plantas'),
    (v_cat_id, 'Farmacéuticos / Investigadores', 'farmacia-farmaceuticos'),
    (v_cat_id, 'Varios', 'farmacia-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 36. COMUNICACIÓN Y PERIODISMO
  INSERT INTO public.categories (name, slug) VALUES ('Comunicación y Periodismo', 'periodismo')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Noticieros', 'periodismo-noticieros'),
    (v_cat_id, 'Diarios', 'periodismo-diarios'),
    (v_cat_id, 'Periodistas', 'periodismo-periodistas'),
    (v_cat_id, 'Programas de radio / Podcast', 'periodismo-radio'),
    (v_cat_id, 'Varios', 'periodismo-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 39. MODA (Versión extendida según solicitud)
  INSERT INTO public.categories (name, slug) VALUES ('Moda', 'moda')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Marcas', 'moda-marcas-2'),
    (v_cat_id, 'Eventos', 'moda-eventos'),
    (v_cat_id, 'Influencers', 'moda-influencers'),
    (v_cat_id, 'Materiales', 'moda-materiales'),
    (v_cat_id, 'Diseñadores', 'moda-disenadores-2'),
    (v_cat_id, 'Organizaciones', 'moda-organizaciones'),
    (v_cat_id, 'Varios', 'moda-varios-2')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 40. COCINA INTERNACIONAL
  INSERT INTO public.categories (name, slug) VALUES ('Cocina Internacional', 'cocina-internacional')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Platos típicos por país', 'cocina-int-platos'),
    (v_cat_id, 'Especias / Condimentos', 'cocina-int-especias'),
    (v_cat_id, 'Técnicas culinarias', 'cocina-int-tecnicas'),
    (v_cat_id, 'Utensilios regionales', 'cocina-int-utensilios'),
    (v_cat_id, 'Chefs internacionales', 'cocina-int-chefs'),
    (v_cat_id, 'Mercados / Ferias', 'cocina-int-mercados'),
    (v_cat_id, 'Varios', 'cocina-int-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 41. PROFESIONES Y OFICIOS
  INSERT INTO public.categories (name, slug) VALUES ('Profesiones y oficios', 'profesiones')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Rubros', 'profesiones-rubros'),
    (v_cat_id, 'Profesionales', 'profesiones-profesionales'),
    (v_cat_id, 'Empresas', 'profesiones-empresas'),
    (v_cat_id, 'Experiencias', 'profesiones-experiencias'),
    (v_cat_id, 'Varios', 'profesiones-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 43. CIBERSEGURIDAD
  INSERT INTO public.categories (name, slug) VALUES ('Ciberseguridad', 'ciberseguridad')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Amenazas / Malware', 'ciber-amenazas'),
    (v_cat_id, 'Herramientas de protección', 'ciber-herramientas'),
    (v_cat_id, 'Hackers / Expertos', 'ciber-hackers'),
    (v_cat_id, 'Certificaciones', 'ciber-certificaciones'),
    (v_cat_id, 'Normativas (GDPR, ISO)', 'ciber-normativas'),
    (v_cat_id, 'Casos de ataques reales', 'ciber-casos'),
    (v_cat_id, 'Varios', 'ciber-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 44. ROBÓTICA
  INSERT INTO public.categories (name, slug) VALUES ('Robótica', 'robotica')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Robots / Modelos', 'robotica-robots'),
    (v_cat_id, 'Fabricantes', 'robotica-fabricantes'),
    (v_cat_id, 'Sensores / Componentes', 'robotica-sensores'),
    (v_cat_id, 'Lenguajes de programación', 'robotica-lenguajes'),
    (v_cat_id, 'Aplicaciones industriales', 'robotica-aplicaciones'),
    (v_cat_id, 'Investigadores', 'robotica-investigadores'),
    (v_cat_id, 'Varios', 'robotica-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 45. COSMETOLOGÍA AVANZADA
  INSERT INTO public.categories (name, slug) VALUES ('Cosmetología Avanzada', 'cosmetologia')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Tratamientos faciales', 'cosmetologia-tratamientos'),
    (v_cat_id, 'Ingredientes activos', 'cosmetologia-ingredientes'),
    (v_cat_id, 'Marcas dermatológicas', 'cosmetologia-marcas'),
    (v_cat_id, 'Equipamiento', 'cosmetologia-equipamiento'),
    (v_cat_id, 'Profesionales', 'cosmetologia-profesionales'),
    (v_cat_id, 'Tendencias', 'cosmetologia-tendencias'),
    (v_cat_id, 'Varios', 'cosmetologia-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 46. OTROS
  INSERT INTO public.categories (name, slug) VALUES ('Otros', 'otros')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Opiniones generales', 'otros-opiniones'),
    (v_cat_id, 'Sugerencias para la plataforma', 'otros-sugerencias'),
    (v_cat_id, 'Preguntas abiertas', 'otros-preguntas'),
    (v_cat_id, 'Experiencias personales', 'otros-experiencias'),
    (v_cat_id, 'Comparativas', 'otros-comparativas'),
    (v_cat_id, 'Conceptos abstractos', 'otros-conceptos'),
    (v_cat_id, 'Varios', 'otros-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- 47. ENTRETENIMIENTO
  INSERT INTO public.categories (name, slug) VALUES ('Entretenimiento', 'entretenimiento')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_id;

  INSERT INTO public.subcategories (category_id, name, slug) VALUES 
    (v_cat_id, 'Celebridades', 'entretenimiento-celebridades'),
    (v_cat_id, 'Influencers', 'entretenimiento-influencers'),
    (v_cat_id, 'Plataformas de entretenimiento', 'entretenimiento-plataformas'),
    (v_cat_id, 'Programas en vivo', 'entretenimiento-programas'),
    (v_cat_id, 'YouTubers', 'entretenimiento-youtubers'),
    (v_cat_id, 'Streamers', 'entretenimiento-streamers'),
    (v_cat_id, 'ARMYs', 'entretenimiento-armys'),
    (v_cat_id, 'Varios', 'entretenimiento-varios')
  ON CONFLICT (category_id, slug) DO NOTHING;

END $$;
