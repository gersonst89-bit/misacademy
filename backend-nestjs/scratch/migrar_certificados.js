const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const rawData = [
  ['220735-2021-00108','2025-05-30','2025-04-06','60071394','Arias','Torrres','2025-01-11','retroexcavadora','Omar Alonso'],
  ['220735-2023-00016','2023-05-08','2023-05-04','73792066','Meza','Salazar','2023-02-05','RETROEXCAVADORA','Crisber Jhonel'],
  ['220735-2024-00019','2024-05-21','2024-05-19','72560186','Cantoral','Asto','2024-02-18','RETROEXCAVADORA','Antoni Luis'],
  ['220735-2024-00048','2024-01-14','2024-01-07','72560187','Cantoral','Asto','2023-11-19','MINI CARGADOR','Ever'],
  ['220735-2024-00049','2024-01-14','2024-01-07','76214381','Gallardo','Huamani','2023-11-19','MINI CARGADOR','Lucas Antonio'],
  ['220735-2024-00080','2024-04-23','2024-04-21','73936516','Sanchez','Reyes','2024-01-17','CARGADOR FRONTAL','Fernando Aurelio'],
  ['220735-2024-00081','2024-09-01','2024-08-25','48582144','HUAMAN','MANGARI','2024-05-26','MONTACARGA','OSCAR STUARDO'],
  ['220735-2024-00082','2024-09-01','2024-08-25','44253481','BRUNO','QUISPE ','2024-05-26','CARGADOR FRONTAL Y MINICARGADOR','JOSE LUIS'],
  ['220735-2024-00083','2024-11-10','2024-10-27','70804129','BAEZ','SULCA ','2024-07-07','RETROEXCAVADORA','ROY ELMER'],
  ['220735-2024-00084','2024-11-10','2024-11-03','75780875','BARRIOS','HUAMAN  ','2024-08-08','RETROEXCAVADORA','ALEJANDRO ABEL'],
  ['220735-2024-00085','2024-11-10','2024-11-03','46888192','HUAMANLAZO','ROJAS ','2024-08-08','RETROEXCAVADORA','JONATHAN ANGEL'],
  ['220735-2024-00086','2024-11-10','2024-11-03','73884742','QUISPE','AZURZA ','2024-08-08','RETROEXCAVADORA Y MONTACARGA','MIGUEL'],
  ['220735-2024-00087','2024-11-10','2024-11-03','77465313','PEREZ','BERROCAL ','2024-08-08','RETROEXCAVADORA','WILSON RAUL'],
  ['220735-2024-00090','2024-11-10','2024-11-03','70185593','ÑAUPA','ARAUJO ','2024-08-08','MOTONIVELADORA','FREDY ALEJANDRO'],
  ['220735-2024-00091','2024-11-10','2024-11-03','70185593','ÑAUPA','ARAUJO ','2024-08-08','RETROEXCAVADORA ','FREDY ALEJANDRO'],
  ['220735-2024-00092','2024-11-10','2024-11-03','76645375','ESPICHAN','RAMOS  ','2024-08-08','RETROEXCAVADORA','WILLY OCTAVIO MARTIN'],
  ['220735-2024-00093','2024-12-23','2024-12-23','76338372','RAMOS','INGA ','2024-12-19','SCALER PAUS','JHON RUBEN'],
  ['220735-2024-00094','2024-12-22','2024-12-22','61309390','ACUÑA','MENDOZA ','2024-09-22','CARGADOR FRONTAL','JEANCARLOS OMAR'],
  ['220735-2024-00095','2024-12-22','2024-12-22','61128373','FLORES','DIAZ ','2024-09-22','CARGADOR FRONTAL Y MONTACARGA','GABRIEL GONZALO'],
  ['220735-2024-00096','2025-02-10','2025-02-05','61128373','FLORES','DIAZ ','2024-11-01','RETROEXCAVADORA','GABRIEL GONZALO'],
  ['220735-2025-000100','2025-03-15','2025-03-09','41485795','Tamayo','Tacanga','2024-11-10','RETROEXCAVADORA Y MONTACARGA','Jesus Alexander'],
  ['220735-2025-000101','2025-03-15','2025-02-23','75604360','Ramos','Ledesma','2024-11-20','RETROEXCAVADORA','Roy Brayan'],
  ['220735-2025-000103','2025-11-15','2025-02-02','73817223','Cecilio','Rojas','2024-08-11','RETROEXCAVADORA  Y RODILLO','Aimar Estefano'],
  ['220735-2025-000104','2025-03-30','2025-03-22','48305329','Fatama','Tapullima','2024-12-22','MINICARGADOR','Rolando'],
  ['220735-2025-000105','2025-04-05','2025-03-30','60074408','Reyes','Bramon','2024-01-25','RETROEXCAVADORA','Jersey Fabrisio'],
  ['220735-2025-000106','2025-04-15','2025-03-30','44150875','De La Cruz','Postillon','2024-12-02','RETROEXCAVADORA','Willian Carlos'],
  ['220735-2025-000107','2025-04-15','2025-04-06','61249190','Maldonado','Luyo','2024-01-13','RETROEXCAVADORA','Deivis Misael'],
  ['220735-2025-00017','2023-02-20','2023-02-19','71028869','Limaymanta','Boza','2022-12-19','RODILLO','Nick Bryan'],
  ['220735-2025-00020','2023-05-30','2023-05-28','72226150','Quispe','Molleda','2023-02-26','RETROEXCAVADORA','Paul Daniel'],
  ['220735-2025-00021','2024-05-14','2024-05-14','60990144','Garcia','Carbajal','2023-02-26','EXCAVADORA HIDRAULICA','Kevin'],
  ['220735-2025-00022','2023-05-14','2023-05-14','71903973','Diaz','Quispe','2023-02-26','RETROEXCAVADORA','Eliezer'],
  ['220735-2025-00023','2023-08-20','2023-08-06','70145644','Contreras','Rosas','2023-07-04','RETROEXCAVADORA','Andres Elias'],
  ['220735-2025-00024','2023-06-14','2023-05-28','74359526','Leon','Ataucusi','2022-02-26','MOTONIVELADORA','Daniel'],
  ['220735-2025-00026','2023-08-20','2023-06-08','73624944','Astuñaupa','Cardenas','2023-06-04','RETROEXCAVADORA','Daniel Alberto'],
  ['220735-2025-00028','2023-08-05','2023-07-30','76919252','Chumpitaz','Cabrera','2023-04-30','RETROEXCAVADORA','Renzo David'],
  ['220735-2025-00029','2023-07-30','2023-07-26','77505099','Castro','Auccapuclla','2023-04-23','RETROEXCAVADORA','Randy Carlos'],
  ['220735-2025-00030','2025-07-28','2025-07-26','72862833','Grandes','Valles','2023-04-16','RETROEXCAVADORA','Carlomagno'],
  ['220735-2025-00031','2023-07-30','2023-07-26','70753709','Quispe','Fernandez','2023-04-16','RETROEXCAVADORA','Miguel Angel'],
  ['220735-2025-00032','2023-07-30','2023-07-26','73388180','Rodriguez','Vicente','2023-04-16','RETROEXCAVADORA','Jeancarlos Omar'],
  ['220735-2025-00033','2023-07-30','2023-07-26','61085893','Meneses','Acuña','2023-04-16','CARGADOR FRONTAL','Jorge Luis'],
  ['220735-2025-00034','2024-07-30','2024-07-26','72560187','Catachunga','Sinuri','2023-04-16','MONTACARGA','Henry'],
  ['220735-2025-00035','2023-10-25','2023-09-10','76854471','Lizardo','Carrillo','2023-04-06','RETROEXCAVADORA','Reynaldo'],
  ['220735-2025-00037','2023-10-25','2023-09-10','48305329','Fatama','Tapullima','2023-07-09','RETROEXCAVADORA','Rolando'],
  ['220735-2025-00039','2023-10-25','2023-10-10','45877575','Villegas','Guizardo','2023-08-27','RETROEXCAVADORA','Edison'],
  ['220735-2025-00041','2023-12-24','2023-12-10','48024227','Meneses','Cullanco','2023-10-08','MONTACARGA','Gilber Duwal'],
  ['220735-2025-00042','2023-12-24','2023-12-10','76564908','Guadalupe','Ramirez','2023-10-08','RETROEXCAVADORA','Emerson Jesus'],
  ['220735-2025-00044','2023-12-24','2023-12-10','61309390','Acuña','Mendoza','2023-10-08','RETROEXCAVADORA','Jeancarlos Omar'],
  ['220735-2025-00045','2024-12-24','2024-08-06','48763184','Ruiz','Tapullima','2023-05-17','CARGADOR FRONTAL','Jared'],
  ['220735-2025-00046','2023-12-24','2023-12-17','48725577','Reymonde','Nuñez','2023-10-08','RETROEXCAVADORA','Juan De Dios'],
  ['220735-2025-00050','2024-10-25','2024-03-24','48305329','Guigues','Saman','2023-12-17','RETROEXCAVADORA Y CARGADOR FRONTAL','Luis Antonio Jesus Martin'],
  ['220735-2025-00051','2024-10-27','2024-03-24','71506174','Huaman','Requena','2023-12-17','RETROEXCAVADORA Y RODILLO','Samir Romario'],
  ['220735-2025-00052','2024-10-25','2024-03-24','48305329','Guigues','Saman','2023-12-17','MINI CARGADOR Y EXCAVADORA HIDRAULICA','Luis Antonio Jesus Martin'],
  ['220735-2025-00054','2024-04-28','2024-04-21','60431576','Lazaro','Inga','2024-01-14','RETROEXCAVADORA','Anderson Aldair'],
  ['220735-2025-00055','2024-04-28','2024-04-01','45454586','Delgado','Laurente','2024-01-14','RETROEXCAVADORA','Eduardo Daniel'],
  ['220735-2025-00056','2024-04-28','2024-04-21','75253793','Ortega','Leguia','2024-01-14','RETROEXCAVADORA','Juberth'],
  ['220735-2025-00057','2024-04-28','2024-04-21','75253781','Ortega','Leguia','2024-01-14','RETROEXCAVADORA','Wilber'],
  ['220735-2025-00063','2024-08-04','2024-05-26','75212514','Martinez','Saldaña','2024-03-03','RETROEXCAVADORA','Armando Alexander'],
  ['220735-2025-00064','2024-08-04','2024-05-26','76133883','Ortega','Galindo','2024-03-03','RETROEXCAVADORA','Jheick Brajhan'],
  ['220735-2025-00065','2024-08-04','2024-05-26','76133883','Guerrero','Bonifacio','2024-03-03','RETROEXCAVADORA Y MONTACARGA','Cesar Alfreso'],
  ['220735-2025-00066','2024-08-04','2024-05-26','77281169','Cardenas','Huaranca','2024-03-03','RETROEXCAVADORA','Jhon Antony'],
  ['220735-2025-00067','2024-08-04','2024-06-29','76828537','Peña','Farceque','2024-04-14','RETROEXCAVADORA','Clismar'],
  ['220735-2025-00068','2024-08-04','2024-06-29','40675081','Elquera','Leon','2024-04-14','RETROEXCAVADORA','Migel Angel'],
  ['220735-2025-00069','2024-08-11','2024-08-04','76585716','Quispe','Canchari','2024-04-21','RETROEXCAVADORA','Jimy Alexander'],
  ['220735-2025-00070','2024-08-11','2024-08-04','61801205','Canchari','Leva','2024-04-21','RETROEXCAVADORA','Kevin Alexander'],
  ['220735-2025-00079','2024-07-28','2024-07-21','77289874','Guerra','Chavez','2024-04-21','CARGADOR FRONTAL','Jose Antonio'],
  ['220735-2025-00080','2024-07-28','2024-07-21','48103131','Mendoza','Allauja','2024-04-21','MONTACARGA','Felix Manuel'],
  ['220735-2025-00088','2024-11-10','2024-11-03','71975656','Romero','Cubillas','2024-08-08','RETROEXCAVADORA Y MONTACARGA','Edison Misael'],
  ['220735-2025-00097','2025-02-05','2025-01-26','61992001','León','Valdez','2024-11-03','RETROEXCAVADORA','Jadiel Stuwar'],
  ['220735-2025-00098','2025-03-15','2025-03-09','47386113','Pujaico','Nieri','2024-12-08','RETROEXCAVADORA','Alexix Danilo'],
  ['220735-2025-00099','2025-02-20','2025-02-16','60071279','Rodriguez','Vasquez','2024-12-08','RETROEXCAVADORA','Carlos Gerardo'],
  ['220735-2025-00107','2025-05-14','2025-05-11','76214381','Gallardo','Huamani','2025-02-09','RETROEXCAVADORA - CARGADOR FRONTAL','Lucas Antonio'],
  ['220735-2025-00108','2025-05-20','2025-05-18','48228617','Salva','Veliz','2025-02-16','CARGADOR FRONTAL','Yerson Esteban'],
  ['220735-2025-00109','2025-05-30','2025-05-25','61347367','Sucasaca','Napa','2025-02-02','RETROEXCAVADORA','Dany Jean Paul'],
  ['220735-2025-00110','2025-04-30','2025-04-13','60077267','Torres','Tadeo','2025-02-09','RETROEXCAVADORA','Cristhian Jhonatan'],
  ['220735-2025-00111','2025-05-30','2025-05-05','77906851','Rios','Ramos','2025-02-02','RETROEXCAVADORA','Alex'],
  ['220735-2025-00112','2025-05-30','2025-05-10','60078057','Huaman','Vilcapuma','2025-03-09','RETROEXCAVADORA','Frizt Deyvi'],
  ['220735-2025-00113','2025-04-30','2025-04-20','61340687','Cerazo','Leon','2025-02-16','RETROEXCAVADORA','Jeimy Zaid'],
  ['220735-2025-00114','2025-05-30','2025-05-18','60255615','Ramos','Raymondi','2024-03-16','RETROEXCAVADORA','Erick Junior'],
  ['220735-2025-00115','2025-03-30','2025-03-08','73979543','Aquino','Rosales','2024-12-08','RETROEXCAVADORA','Daniel Alexander'],
  ['220735-2025-00116','2025-07-31','2025-06-15','60319861','Garcia','Ocampo','2025-03-02','RETROEXCAVADORA','Manuel'],
  ['220735-2025-00117','2025-07-31','2025-07-20','78802528','Aguero','Berrios','2025-05-04','RETROEXCAVADORA','Rosmel Benjamin'],
  ['220735-2025-00118','2025-04-15','2025-03-30','60383201','Quiroz','Moriano','2025-01-10','RETROEXCAVADORA','Guillermo Belar'],
  ['220735-2025-00119','2025-07-15','2025-06-29','76930447','Gonzales','Rodriguez','2025-03-23','RETROEXCAVADORA','Gabriel Antonio'],
  ['220735-2025-00121','2025-04-30','2025-04-14','48575422','Toscano','Galingo','2025-02-16','MONTACARGA','Ruben Williams'],
  ['220735-2025-00122','2025-07-30','2025-07-15','75992622','Huaman','Rojas','2025-05-15','MONTACARGA','Clisman Kenedy'],
  ['220735-2025-00123','2025-07-31','2025-07-15','76630147','Davila','Portuguez','2025-05-15','RETROEXCAVADORA Y MINICARGADOR','Aldair Giovanni'],
  ['220735-2025-00124','2025-08-31','2025-08-17','74455524','Soriano','Vivas','2025-07-01','RETROEXCAVADORA','Elber Jorginho'],
  ['220735-2025-00125','2025-08-31','2025-08-17','74455523','Soriano','Vivas','2025-07-01','CARGADOR FRONTAL Y RETROEXCAVADORA','Luis Gustavo'],
  ['220735-2025-00126','2025-08-30','2025-08-17','61249016','Sanchez','Ochante','2025-05-25','RETROEXCAVADORA','Jose Junior'],
  ['220735-2025-00127','2025-06-30','2025-06-15','70780622','Caja','Goitia','2025-03-09','CARGADOR FRONTAL Y RETROEXCAVADORA','Jose Jorge'],
  ['220735-2025-00128','2025-07-31','2025-07-20','60319861','Garcia','Ocampo','2025-04-20','RODILLO Y MINICARGADOR DE 10 TONELADAS','Manuel'],
  ['220735-2025-00129','2025-09-20','2025-09-15','72558515','Huaman','Suarez','2025-07-15','CARGADOR FRONTAL Y RETROEXCAVADORA','Alejandro Starky'],
  ['220735-2025-00130','2025-10-15','2025-10-10','16447554','Ruiz','Estrella','2025-08-10','RETROEXCAVSDORA Y EXCAVADORA','Jonny'],
  ['220735-2025-00131','2025-10-15','2025-10-10','78203327','Aval','Mendoza','2025-08-10','MONTACARGA','Edwin Kleybert'],
  ['220735-2025-00132','2025-10-15','2025-10-10','48304453','Diaz','Apolaya','2025-08-10','CARGADOR FRONTAL','Victor Raul'],
  ['220735-2025-00133','2025-10-25','2025-10-16','61240881','Chujandama','Santi','2025-08-16','RETROEXCAVADORA','Holger Jared'],
  ['220735-2025-00134','2025-11-05','2025-10-29','62646418','Echevarria','Ramos','2025-06-29','RETROEXCAVADORA Y EXCAVADORA','Ronaldo Fabricio'],
  ['220735-2025-00135','2025-11-05','2025-10-29','47629454','Chumpitaz','Rolando','2025-06-29','RETROEXCAVADORA','Israel'],
  ['220735-2025-00136','2025-10-30','2025-10-15','76950871','Jara','Pablo','2025-06-01','RETROEXCAVADORA Y CARGADOR FRONTAL','Jhojann Kenyi'],
  ['220735-2025-00137','2025-10-30','2025-10-15','42548545','Escobar','Marquez','2025-06-01','retroexcavadora','Eduardo Agustin'],
  ['220735-2025-00138','2025-10-30','2025-10-15','73124946','Vicente','Chaname','2025-06-01','RETROEXCAVADORA','Luis Jesus'],
  ['220735-2025-00139','2025-12-30','2025-12-21','48798320','Quispe','Yuca','2025-10-26','retroexcavadora','Alfredo'],
  ['220735-2025-00141','2025-12-30','2025-12-21','06725675','Gomez','Garagate','2025-10-26','RETROEXCAVADORA','Simmons David'],
  ['220735-2025-00142','2025-11-15','2025-11-02','70072069','Gomez','Quispe','2025-09-07','RETROEXCAVADORA','Armando Maller'],
  ['220735-2025-00143','2025-04-30','2025-04-21','61133369','Ruiz','Avalos','2025-02-02','RETROEXCAVADORA','Luis Andreu Maximo'],
  ['220735-2025-00144','2025-12-30','2025-12-21','75454674','Flores','Romero','2025-10-12','RETROEXCAVADORA','Johan Raul'],
  ['220735-2025-00145','2025-09-30','2025-09-14','45759618','Benito','Crisostomo','2025-07-27','RETROEXCAVADORA','Juan Roman'],
  ['220735-2025-00150','2022-07-18','2022-07-15','70811333','Yalle','Leva','2022-05-04','EXCAVADORA ORUGA','Yuri Arturo'],
  ['220735-2025-0040','2025-12-30','2025-12-21','43300529','Marcas','Valdez','2025-10-26','retroexcavadora y cargador frontal','Edgar'],
  ['220735-2025-1245','2026-02-08','2025-12-21','43646323','Yactayo','Taya','2025-10-12','retroexcavadora','Aldo Manuel'],
  ['220735-2026-001','2026-02-04','2026-02-01','71510516','Salirrosas','Puma','2025-11-02','MONTACARGA - APILADOR ELECTRICO','Jhonatan Francisco'],
  ['220735-2026-002','2026-04-07','2026-04-05','47847860','Abad','Flores','2026-01-04','EXCAVADORA HIDRAULICA','Freddli'],
  ['220735-2026-004','2026-03-09','2026-02-22','75832989','Cusi','Leguia','2025-12-07','Retroexcavadora','Agustin Sebastian'],
  ['220735-2026-005','2026-03-30','2026-03-29','72147099','Morales','Mauriola','2025-12-28','RETROEXCAVADORA - MINICARGADOR','Juan Helber'],
  ['220735-2026-007','2026-03-30','2026-03-29','72147099','Morales','Mauriola','2026-01-14','CARGADOR FRONTAL','Juan Helber'],
  ['220735-2026-009','2026-04-05','2026-03-29','62242246','Ccollana','Auccapuclla','2025-12-28','MONTACARGA','Karol Moises'],
  ['220735-2026-010','2026-04-11','2026-03-29','73124946','Vicente','Chaname','2025-12-28','MINICARGADOR','Luis Jesus'],
  ['220735-2026-011','2026-04-21','2026-04-05','61507503','Velasquez','Gonzales','2026-01-04','RETROEXCAVADORA','Beyson Andrey'],
  ['220735-2026-012','2026-04-25','2026-04-12','73178461','Cortez','Aybar','2026-01-11','RETROEXCAVADORA','Jeisson David'],
  ['220735-2026-013','2026-05-15','2026-05-10','62327670','Garriazo','Cruz','2026-02-08','CARGADOR FRONTAL','Manuel Smith'],
  ['220735-2026-014','2026-05-19','2026-05-17','60070872','Romero','Navarro','2026-03-01','RETROEXCAVADORA','Frank Junior'],
  ['220735-2026-015','2026-05-25','2026-05-17','48894453','Tamani','Alava','2026-02-15','MONTACARGA','Candy Llomira'],
  ['220735-2026-016','2026-06-15','2026-06-14','77281169','Cardenas','Huarancca','2026-03-15','MINICARGADOR','Jhon Antony'],
  ['220735-2026-017','2026-06-30','2026-06-28','61525803','Sanchez','Gutierrez','2026-05-17','RETROEXCAVADORA','Adrian Deyvis Eduardo'],
  ['220735-2026-018','2026-07-11','2026-07-05','71199753','Cusi','Flores','2026-04-05','RETROEXCAVADORA - EXCAVADORA','Victor'],
  ['220735-2026-019','2026-07-15','2026-07-12','73831207','Ortiz','Villanueva','2026-04-12','RETROEXCAVADORA','Christian Luis'],
  ['220735-2026-020','2026-07-21','2026-07-19','71975294','Crispin','Alcoser','2026-04-12','RETROEXCAVADORA - CARGADOR FRONTAL','Cesar William'],
  ['220735-2026-021','2026-07-25','2026-07-19','60045696','Gutierrez','Gamboa','2026-05-17','RETROEXCAVADORA','Jhustin Ivan'],
  ['220735-2026-022','2026-07-27','2026-07-26','73625099','Huari','Yauri','2026-04-26','RETROEXCAVADORA - EXCAVADORA HIDRAULICA','Joseph Nilver'],
  ['220735-2026-023','2026-07-27','2026-07-26','73625099','Huari','Yauri','2026-04-26','CARGADOR FRONTAL','Jhoseph Nilver'],
  ['220735-2026-024','2026-07-28','2026-07-26','70831368','Gutierrez','Carbonero','2026-04-26','CARGADOR FRONTAL','Inder Yair'],
  ['220735-2026-025','2026-08-08','2026-08-02','61248975','Arratea','Ipanaque','2026-05-03','RETROEXCAVADORA','Alejandro'],
  ['220735-2026-026','2026-08-17','2026-08-16','61315598','Sierra','Sullon','2026-06-14','RETROEXCAVADORA','Jose Emanuel']
];

async function migrate() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'mis_academy',
    port: 3306
  });

  try {
    for (const record of rawData) {
      const [id, fecha_emision, fecha_culminacion, dni, apellido_materno, apellido_paterno, fecha_ingreso, curso_realizado, nombres] = record;
      
      // Buscar usuario por DNI
      const [userRows] = await connection.query('SELECT id_usuario FROM usuarios WHERE dni = ? LIMIT 1', [dni]);
      let id_usuario = null;

      if (userRows.length > 0) {
        id_usuario = userRows[0].id_usuario;
      } else {
        // Crear usuario
        const email = dni + '@alumno.local';
        const hashedPassword = await bcrypt.hash(dni, 10);
        const fullName = nombres;
        const apellidos = apellido_paterno + ' ' + apellido_materno;

        const [insertUser] = await connection.query(
          "INSERT INTO usuarios (id_rol, nombre, apellido, dni, email, password, estado, email_verificado) VALUES (2, ?, ?, ?, ?, ?, 'Activo', 1)",
          [fullName, apellidos, dni, email, hashedPassword]
        );
        id_usuario = insertUser.insertId;
        console.log("Usuario creado para DNI " + dni);
      }

      // Nombre completo del estudiante
      const nombreEstudiante = (nombres + ' ' + apellido_paterno + ' ' + apellido_materno).trim();

      // Insertar en certificaciones
      await connection.query(
        "INSERT INTO certificaciones (id_usuario, codigo_certificado, nombre_estudiante, nombre_curso, tipo_certificado, fecha_emision, fecha_inicio, fecha_fin, estado, created_at, updated_at) VALUES (?, ?, ?, ?, 'Certificado de Aprobación', ?, ?, ?, 'Activo', NOW(), NOW())",
        [id_usuario, id, nombreEstudiante, curso_realizado, fecha_emision, fecha_ingreso, fecha_culminacion]
      );
      console.log("Certificado insertado: " + id);
    }

    console.log('Migracion completada.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await connection.end();
  }
}

migrate();
