// Données spécifiques à l'Algérie pour le formulaire d'inscription

// Les 58 Wilayas d'Algérie
export const ALGERIA_WILAYAS = [
  { code: "01", name: "Adrar", nameAr: "أدرار" },
  { code: "02", name: "Chlef", nameAr: "الشلف" },
  { code: "03", name: "Laghouat", nameAr: "الأغواط" },
  { code: "04", name: "Oum El Bouaghi", nameAr: "أم البواقي" },
  { code: "05", name: "Batna", nameAr: "باتنة" },
  { code: "06", name: "Béjaïa", nameAr: "بجاية" },
  { code: "07", name: "Biskra", nameAr: "بسكرة" },
  { code: "08", name: "Béchar", nameAr: "بشار" },
  { code: "09", name: "Blida", nameAr: "البليدة" },
  { code: "10", name: "Bouira", nameAr: "البويرة" },
  { code: "11", name: "Tamanrasset", nameAr: "تمنراست" },
  { code: "12", name: "Tébessa", nameAr: "تبسة" },
  { code: "13", name: "Tlemcen", nameAr: "تلمسان" },
  { code: "14", name: "Tiaret", nameAr: "تيارت" },
  { code: "15", name: "Tizi Ouzou", nameAr: "تيزي وزو" },
  { code: "16", name: "Alger", nameAr: "الجزائر" },
  { code: "17", name: "Djelfa", nameAr: "الجلفة" },
  { code: "18", name: "Jijel", nameAr: "جيجل" },
  { code: "19", name: "Sétif", nameAr: "سطيف" },
  { code: "20", name: "Saïda", nameAr: "سعيدة" },
  { code: "21", name: "Skikda", nameAr: "سكيكدة" },
  { code: "22", name: "Sidi Bel Abbès", nameAr: "سيدي بلعباس" },
  { code: "23", name: "Annaba", nameAr: "عنابة" },
  { code: "24", name: "Guelma", nameAr: "قالمة" },
  { code: "25", name: "Constantine", nameAr: "قسنطينة" },
  { code: "26", name: "Médéa", nameAr: "المدية" },
  { code: "27", name: "Mostaganem", nameAr: "مستغانم" },
  { code: "28", name: "M'Sila", nameAr: "المسيلة" },
  { code: "29", name: "Mascara", nameAr: "معسكر" },
  { code: "30", name: "Ouargla", nameAr: "ورقلة" },
  { code: "31", name: "Oran", nameAr: "وهران" },
  { code: "32", name: "El Bayadh", nameAr: "البيض" },
  { code: "33", name: "Illizi", nameAr: "إليزي" },
  { code: "34", name: "Bordj Bou Arreridj", nameAr: "برج بوعريريج" },
  { code: "35", name: "Boumerdès", nameAr: "بومرداس" },
  { code: "36", name: "El Tarf", nameAr: "الطارف" },
  { code: "37", name: "Tindouf", nameAr: "تندوف" },
  { code: "38", name: "Tissemsilt", nameAr: "تسمسيلت" },
  { code: "39", name: "El Oued", nameAr: "الوادي" },
  { code: "40", name: "Khenchela", nameAr: "خنشلة" },
  { code: "41", name: "Souk Ahras", nameAr: "سوق أهراس" },
  { code: "42", name: "Tipaza", nameAr: "تيبازة" },
  { code: "43", name: "Mila", nameAr: "ميلة" },
  { code: "44", name: "Aïn Defla", nameAr: "عين الدفلى" },
  { code: "45", name: "Naâma", nameAr: "النعامة" },
  { code: "46", name: "Aïn Témouchent", nameAr: "عين تموشنت" },
  { code: "47", name: "Ghardaïa", nameAr: "غرداية" },
  { code: "48", name: "Relizane", nameAr: "غليزان" },
  { code: "49", name: "Timimoun", nameAr: "تيميمون" },
  { code: "50", name: "Bordj Badji Mokhtar", nameAr: "برج باجي مختار" },
  { code: "51", name: "Ouled Djellal", nameAr: "أولاد جلال" },
  { code: "52", name: "Béni Abbès", nameAr: "بني عباس" },
  { code: "53", name: "In Salah", nameAr: "عين صالح" },
  { code: "54", name: "In Guezzam", nameAr: "عين قزام" },
  { code: "55", name: "Touggourt", nameAr: "تقرت" },
  { code: "56", name: "Djanet", nameAr: "جانت" },
  { code: "57", name: "El M'Ghair", nameAr: "المغير" },
  { code: "58", name: "El Meniaa", nameAr: "المنيعة" }
];

// Universités algériennes avec pôle médecine/paramédical/sciences de la santé
export const ALGERIA_MEDICAL_UNIVERSITIES = [
  // Alger
  { id: "alger1", name: "Université d'Alger 1 - Benyoucef Benkhedda", city: "Alger", hasEnglish: true },
  { id: "alger_medecine", name: "Université d'Alger - Faculté de Médecine", city: "Alger", hasEnglish: true },
  { id: "usthb", name: "USTHB - Université des Sciences et de la Technologie Houari Boumediene", city: "Alger", hasEnglish: true },
  { id: "blida1", name: "Université Blida 1 - Saad Dahleb (Faculté de Médecine)", city: "Blida", hasEnglish: true },
  
  // Oran
  { id: "oran1", name: "Université d'Oran 1 - Ahmed Ben Bella (Faculté de Médecine)", city: "Oran", hasEnglish: true },
  { id: "oran_sba", name: "Université de Sidi Bel Abbès - Djillali Liabes", city: "Sidi Bel Abbès", hasEnglish: false },
  { id: "tlemcen", name: "Université Abou Bekr Belkaid de Tlemcen (Faculté de Médecine)", city: "Tlemcen", hasEnglish: true },
  { id: "mostaganem", name: "Université de Mostaganem - Abdelhamid Ibn Badis", city: "Mostaganem", hasEnglish: false },
  
  // Constantine
  { id: "constantine3", name: "Université Constantine 3 - Salah Boubnider (Faculté de Médecine)", city: "Constantine", hasEnglish: true },
  { id: "setif", name: "Université Ferhat Abbas de Sétif 1 (Faculté de Médecine)", city: "Sétif", hasEnglish: true },
  { id: "annaba", name: "Université Badji Mokhtar d'Annaba (Faculté de Médecine)", city: "Annaba", hasEnglish: true },
  { id: "batna", name: "Université Batna 2 - Mustapha Ben Boulaïd (Faculté de Médecine)", city: "Batna", hasEnglish: false },
  { id: "bejaia", name: "Université Abderrahmane Mira de Béjaïa", city: "Béjaïa", hasEnglish: false },
  { id: "jijel", name: "Université Mohammed Seddik Ben Yahia de Jijel", city: "Jijel", hasEnglish: false },
  
  // Autres wilayas
  { id: "tiaret", name: "Université Ibn Khaldoun de Tiaret", city: "Tiaret", hasEnglish: false },
  { id: "tizi", name: "Université Mouloud Mammeri de Tizi Ouzou", city: "Tizi Ouzou", hasEnglish: false },
  { id: "medea", name: "Université Yahia Farès de Médéa", city: "Médéa", hasEnglish: false },
  { id: "bba", name: "Université Mohamed El Bachir El Ibrahimi de Bordj Bou Arréridj", city: "Bordj Bou Arréridj", hasEnglish: false },
  { id: "guelma", name: "Université 8 Mai 1945 de Guelma", city: "Guelma", hasEnglish: false },
  { id: "ouargla", name: "Université Kasdi Merbah d'Ouargla", city: "Ouargla", hasEnglish: false },
  { id: "biskra", name: "Université Mohamed Khider de Biskra", city: "Biskra", hasEnglish: false },
  { id: "bechar", name: "Université Tahri Mohamed de Béchar", city: "Béchar", hasEnglish: false },
  { id: "elou", name: "Université Hamma Lakhdar d'El Oued", city: "El Oued", hasEnglish: false },
  { id: "oeb", name: "Université Larbi Ben M'Hidi d'Oum El Bouaghi", city: "Oum El Bouaghi", hasEnglish: false },
  { id: "skikda", name: "Université 20 Août 1955 de Skikda", city: "Skikda", hasEnglish: false },
  { id: "souk", name: "Université Mohamed-Chérif Messaadia de Souk Ahras", city: "Souk Ahras", hasEnglish: false },
  { id: "mila", name: "Université Abdelhafid Boussouf de Mila", city: "Mila", hasEnglish: false },
  { id: "chlef", name: "Université Hassiba Benbouali de Chlef", city: "Chlef", hasEnglish: false },
  { id: "khenchela", name: "Université Abbas Laghrour de Khenchela", city: "Khenchela", hasEnglish: false },
  { id: "relizane", name: "Université Ahmed Zabana de Relizane", city: "Relizane", hasEnglish: false },
  
  // Écoles paramédicales nationales
  { id: "insp", name: "INSP - Institut National de Santé Publique", city: "Alger", hasEnglish: true },
  { id: "inp_alger", name: "INP - Institut National de Pédagogie", city: "Alger", hasEnglish: false },
  { id: "paramedical_alger", name: "École Nationale Supérieure de Formation Paramédicale - Alger", city: "Alger", hasEnglish: false },
  { id: "paramedical_oran", name: "École Nationale Supérieure de Formation Paramédicale - Oran", city: "Oran", hasEnglish: false },
  { id: "paramedical_constantine", name: "École Nationale Supérieure de Formation Paramédicale - Constantine", city: "Constantine", hasEnglish: false }
];

// Pays populaires pour les étudiants non-algériens
export const COUNTRIES = [
  { code: "DZ", name: "Algérie", nameEn: "Algeria", nameAr: "الجزائر" },
  { code: "TN", name: "Tunisie", nameEn: "Tunisia", nameAr: "تونس" },
  { code: "MA", name: "Maroc", nameEn: "Morocco", nameAr: "المغرب" },
  { code: "EG", name: "Égypte", nameEn: "Egypt", nameAr: "مصر" },
  { code: "LY", name: "Libye", nameEn: "Libya", nameAr: "ليبيا" },
  { code: "MR", name: "Mauritanie", nameEn: "Mauritania", nameAr: "موريتانيا" },
  { code: "FR", name: "France", nameEn: "France", nameAr: "فرنسا" },
  { code: "BE", name: "Belgique", nameEn: "Belgium", nameAr: "بلجيكا" },
  { code: "CA", name: "Canada", nameEn: "Canada", nameAr: "كندا" },
  { code: "US", name: "États-Unis", nameEn: "United States", nameAr: "الولايات المتحدة" },
  { code: "GB", name: "Royaume-Uni", nameEn: "United Kingdom", nameAr: "المملكة المتحدة" },
  { code: "DE", name: "Allemagne", nameEn: "Germany", nameAr: "ألمانيا" },
  { code: "OTHER", name: "Autre", nameEn: "Other", nameAr: "أخرى" }
];

// Statuts d'utilisateur
export const USER_STATUSES = [
  { value: "student", labelFr: "Étudiant(e)", labelEn: "Student", labelAr: "طالب/ة" },
  { value: "professor", labelFr: "Professeur / Enseignant", labelEn: "Professor / Teacher", labelAr: "أستاذ / معلم" },
  { value: "phd", labelFr: "Doctorant(e) / Chercheur", labelEn: "PhD Student / Researcher", labelAr: "طالب دكتوراه / باحث" },
  { value: "other", labelFr: "Autre", labelEn: "Other", labelAr: "آخر" }
];
