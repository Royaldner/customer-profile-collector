// Philippine Standard Geographic Code (PSGC) data
// Simplified version with major cities/municipalities and their barangays

export interface Location {
  code: string
  name: string
  province: string
  region: string
}

export interface Barangay {
  code: string
  name: string
  cityCode: string
}

// Major cities and municipalities in the Philippines
export const cities: Location[] = [
  // NCR - Metro Manila
  { code: "137401", name: "Caloocan", province: "Metro Manila", region: "NCR" },
  { code: "137402", name: "Las Piñas", province: "Metro Manila", region: "NCR" },
  { code: "137403", name: "Makati", province: "Metro Manila", region: "NCR" },
  { code: "137404", name: "Malabon", province: "Metro Manila", region: "NCR" },
  { code: "137405", name: "Mandaluyong", province: "Metro Manila", region: "NCR" },
  { code: "137406", name: "Manila", province: "Metro Manila", region: "NCR" },
  { code: "137407", name: "Marikina", province: "Metro Manila", region: "NCR" },
  { code: "137408", name: "Muntinlupa", province: "Metro Manila", region: "NCR" },
  { code: "137409", name: "Navotas", province: "Metro Manila", region: "NCR" },
  { code: "137410", name: "Parañaque", province: "Metro Manila", region: "NCR" },
  { code: "137411", name: "Pasay", province: "Metro Manila", region: "NCR" },
  { code: "137412", name: "Pasig", province: "Metro Manila", region: "NCR" },
  { code: "137413", name: "Pateros", province: "Metro Manila", region: "NCR" },
  { code: "137414", name: "Quezon City", province: "Metro Manila", region: "NCR" },
  { code: "137415", name: "San Juan", province: "Metro Manila", region: "NCR" },
  { code: "137416", name: "Taguig", province: "Metro Manila", region: "NCR" },
  { code: "137417", name: "Valenzuela", province: "Metro Manila", region: "NCR" },

  // Region III - Central Luzon
  { code: "030801", name: "Angeles", province: "Pampanga", region: "Region III" },
  { code: "030802", name: "San Fernando", province: "Pampanga", region: "Region III" },
  { code: "030803", name: "Mabalacat", province: "Pampanga", region: "Region III" },
  { code: "031401", name: "Olongapo", province: "Zambales", region: "Region III" },
  { code: "030101", name: "Balanga", province: "Bataan", region: "Region III" },
  { code: "030401", name: "Cabanatuan", province: "Nueva Ecija", region: "Region III" },
  { code: "030402", name: "San Jose", province: "Nueva Ecija", region: "Region III" },
  { code: "030901", name: "Tarlac City", province: "Tarlac", region: "Region III" },
  { code: "030201", name: "Meycauayan", province: "Bulacan", region: "Region III" },
  { code: "030202", name: "Malolos", province: "Bulacan", region: "Region III" },
  { code: "030203", name: "San Jose del Monte", province: "Bulacan", region: "Region III" },

  // Region IV-A - CALABARZON
  { code: "041001", name: "Batangas City", province: "Batangas", region: "Region IV-A" },
  { code: "041002", name: "Lipa", province: "Batangas", region: "Region IV-A" },
  { code: "041003", name: "Tanauan", province: "Batangas", region: "Region IV-A" },
  { code: "041004", name: "Santo Tomas", province: "Batangas", region: "Region IV-A" },
  { code: "042101", name: "Bacoor", province: "Cavite", region: "Region IV-A" },
  { code: "042102", name: "Cavite City", province: "Cavite", region: "Region IV-A" },
  { code: "042103", name: "Dasmariñas", province: "Cavite", region: "Region IV-A" },
  { code: "042104", name: "General Trias", province: "Cavite", region: "Region IV-A" },
  { code: "042105", name: "Imus", province: "Cavite", region: "Region IV-A" },
  { code: "042106", name: "Tagaytay", province: "Cavite", region: "Region IV-A" },
  { code: "043401", name: "Calamba", province: "Laguna", region: "Region IV-A" },
  { code: "043402", name: "San Pablo", province: "Laguna", region: "Region IV-A" },
  { code: "043403", name: "Santa Rosa", province: "Laguna", region: "Region IV-A" },
  { code: "043404", name: "Biñan", province: "Laguna", region: "Region IV-A" },
  { code: "043405", name: "Cabuyao", province: "Laguna", region: "Region IV-A" },
  { code: "045601", name: "Antipolo", province: "Rizal", region: "Region IV-A" },
  { code: "045602", name: "Cainta", province: "Rizal", region: "Region IV-A" },
  { code: "045603", name: "Taytay", province: "Rizal", region: "Region IV-A" },
  { code: "045604", name: "Rodriguez", province: "Rizal", region: "Region IV-A" },
  { code: "045605", name: "San Mateo", province: "Rizal", region: "Region IV-A" },
  { code: "045606", name: "Angono", province: "Rizal", region: "Region IV-A" },
  { code: "045607", name: "Binangonan", province: "Rizal", region: "Region IV-A" },
  { code: "045608", name: "Cardona", province: "Rizal", region: "Region IV-A" },
  { code: "045609", name: "Morong", province: "Rizal", region: "Region IV-A" },
  { code: "045610", name: "Tanay", province: "Rizal", region: "Region IV-A" },
  { code: "045611", name: "Teresa", province: "Rizal", region: "Region IV-A" },
  { code: "045612", name: "Baras", province: "Rizal", region: "Region IV-A" },
  { code: "045613", name: "Pililla", province: "Rizal", region: "Region IV-A" },
  { code: "045614", name: "Jala-Jala", province: "Rizal", region: "Region IV-A" },
  { code: "045901", name: "Lucena", province: "Quezon", region: "Region IV-A" },
  { code: "045902", name: "Tayabas", province: "Quezon", region: "Region IV-A" },

  // Region VII - Central Visayas
  { code: "072201", name: "Cebu City", province: "Cebu", region: "Region VII" },
  { code: "072202", name: "Mandaue", province: "Cebu", region: "Region VII" },
  { code: "072203", name: "Lapu-Lapu", province: "Cebu", region: "Region VII" },
  { code: "072204", name: "Talisay", province: "Cebu", region: "Region VII" },
  { code: "072205", name: "Danao", province: "Cebu", region: "Region VII" },
  { code: "072206", name: "Carcar", province: "Cebu", region: "Region VII" },
  { code: "071201", name: "Tagbilaran", province: "Bohol", region: "Region VII" },

  // Region XI - Davao Region
  { code: "112401", name: "Davao City", province: "Davao del Sur", region: "Region XI" },
  { code: "112402", name: "Digos", province: "Davao del Sur", region: "Region XI" },
  { code: "112501", name: "Tagum", province: "Davao del Norte", region: "Region XI" },
  { code: "112502", name: "Panabo", province: "Davao del Norte", region: "Region XI" },
  { code: "112503", name: "Samal", province: "Davao del Norte", region: "Region XI" },

  // Region I - Ilocos Region
  { code: "012801", name: "Laoag", province: "Ilocos Norte", region: "Region I" },
  { code: "012901", name: "Vigan", province: "Ilocos Sur", region: "Region I" },
  { code: "015501", name: "Dagupan", province: "Pangasinan", region: "Region I" },
  { code: "015502", name: "San Carlos", province: "Pangasinan", region: "Region I" },
  { code: "015503", name: "Urdaneta", province: "Pangasinan", region: "Region I" },
  { code: "015504", name: "Alaminos", province: "Pangasinan", region: "Region I" },
  { code: "013301", name: "San Fernando", province: "La Union", region: "Region I" },

  // Region II - Cagayan Valley
  { code: "021501", name: "Tuguegarao", province: "Cagayan", region: "Region II" },
  { code: "023101", name: "Cauayan", province: "Isabela", region: "Region II" },
  { code: "023102", name: "Ilagan", province: "Isabela", region: "Region II" },
  { code: "023103", name: "Santiago", province: "Isabela", region: "Region II" },

  // CAR - Cordillera Administrative Region
  { code: "140101", name: "Baguio", province: "Benguet", region: "CAR" },
  { code: "140201", name: "Tabuk", province: "Kalinga", region: "CAR" },

  // Region V - Bicol Region
  { code: "050501", name: "Legazpi", province: "Albay", region: "Region V" },
  { code: "050502", name: "Tabaco", province: "Albay", region: "Region V" },
  { code: "050503", name: "Ligao", province: "Albay", region: "Region V" },
  { code: "051701", name: "Naga", province: "Camarines Sur", region: "Region V" },
  { code: "051702", name: "Iriga", province: "Camarines Sur", region: "Region V" },
  { code: "056201", name: "Sorsogon City", province: "Sorsogon", region: "Region V" },

  // Region VI - Western Visayas
  { code: "063001", name: "Iloilo City", province: "Iloilo", region: "Region VI" },
  { code: "063002", name: "Passi", province: "Iloilo", region: "Region VI" },
  { code: "064501", name: "Bacolod", province: "Negros Occidental", region: "Region VI" },
  { code: "064502", name: "Bago", province: "Negros Occidental", region: "Region VI" },
  { code: "064503", name: "Cadiz", province: "Negros Occidental", region: "Region VI" },
  { code: "064504", name: "Escalante", province: "Negros Occidental", region: "Region VI" },
  { code: "064505", name: "Himamaylan", province: "Negros Occidental", region: "Region VI" },
  { code: "064506", name: "Kabankalan", province: "Negros Occidental", region: "Region VI" },
  { code: "064507", name: "La Carlota", province: "Negros Occidental", region: "Region VI" },
  { code: "064508", name: "Sagay", province: "Negros Occidental", region: "Region VI" },
  { code: "064509", name: "San Carlos", province: "Negros Occidental", region: "Region VI" },
  { code: "064510", name: "Silay", province: "Negros Occidental", region: "Region VI" },
  { code: "064511", name: "Sipalay", province: "Negros Occidental", region: "Region VI" },
  { code: "064512", name: "Talisay", province: "Negros Occidental", region: "Region VI" },
  { code: "064513", name: "Victorias", province: "Negros Occidental", region: "Region VI" },
  { code: "060401", name: "Roxas City", province: "Capiz", region: "Region VI" },

  // Region VIII - Eastern Visayas
  { code: "083701", name: "Tacloban", province: "Leyte", region: "Region VIII" },
  { code: "083702", name: "Ormoc", province: "Leyte", region: "Region VIII" },
  { code: "086001", name: "Calbayog", province: "Samar", region: "Region VIII" },
  { code: "086002", name: "Catbalogan", province: "Samar", region: "Region VIII" },

  // Region IX - Zamboanga Peninsula
  { code: "097201", name: "Zamboanga City", province: "Zamboanga del Sur", region: "Region IX" },
  { code: "097301", name: "Pagadian", province: "Zamboanga del Sur", region: "Region IX" },
  { code: "097101", name: "Dipolog", province: "Zamboanga del Norte", region: "Region IX" },
  { code: "097102", name: "Dapitan", province: "Zamboanga del Norte", region: "Region IX" },

  // Region X - Northern Mindanao
  { code: "101301", name: "Cagayan de Oro", province: "Misamis Oriental", region: "Region X" },
  { code: "101302", name: "Gingoog", province: "Misamis Oriental", region: "Region X" },
  { code: "101801", name: "Iligan", province: "Lanao del Norte", region: "Region X" },
  { code: "101201", name: "Ozamiz", province: "Misamis Occidental", region: "Region X" },
  { code: "101202", name: "Oroquieta", province: "Misamis Occidental", region: "Region X" },
  { code: "101203", name: "Tangub", province: "Misamis Occidental", region: "Region X" },
  { code: "101001", name: "Malaybalay", province: "Bukidnon", region: "Region X" },
  { code: "101002", name: "Valencia", province: "Bukidnon", region: "Region X" },

  // Region XII - SOCCSKSARGEN
  { code: "126301", name: "General Santos", province: "South Cotabato", region: "Region XII" },
  { code: "126302", name: "Koronadal", province: "South Cotabato", region: "Region XII" },
  { code: "124701", name: "Cotabato City", province: "Maguindanao", region: "Region XII" },
  { code: "126401", name: "Tacurong", province: "Sultan Kudarat", region: "Region XII" },
  { code: "124301", name: "Kidapawan", province: "Cotabato", region: "Region XII" },

  // Region XIII - Caraga
  { code: "160201", name: "Butuan", province: "Agusan del Norte", region: "Region XIII" },
  { code: "160202", name: "Cabadbaran", province: "Agusan del Norte", region: "Region XIII" },
  { code: "166701", name: "Surigao City", province: "Surigao del Norte", region: "Region XIII" },
  { code: "166801", name: "Bislig", province: "Surigao del Sur", region: "Region XIII" },
  { code: "166802", name: "Tandag", province: "Surigao del Sur", region: "Region XIII" },
  { code: "168501", name: "Bayugan", province: "Agusan del Sur", region: "Region XIII" },

  // BARMM - Bangsamoro
  { code: "153801", name: "Marawi", province: "Lanao del Sur", region: "BARMM" },
  { code: "150701", name: "Lamitan", province: "Basilan", region: "BARMM" },
  { code: "150702", name: "Isabela City", province: "Basilan", region: "BARMM" },
  { code: "156601", name: "Jolo", province: "Sulu", region: "BARMM" },
  { code: "157001", name: "Bongao", province: "Tawi-Tawi", region: "BARMM" },
]

// Sample barangays for major cities (this would be a much larger dataset in production)
export const barangays: Barangay[] = [
  // Makati
  { code: "137403001", name: "Bangkal", cityCode: "137403" },
  { code: "137403002", name: "Bel-Air", cityCode: "137403" },
  { code: "137403003", name: "Carmona", cityCode: "137403" },
  { code: "137403004", name: "Cembo", cityCode: "137403" },
  { code: "137403005", name: "Comembo", cityCode: "137403" },
  { code: "137403006", name: "Dasmariñas", cityCode: "137403" },
  { code: "137403007", name: "East Rembo", cityCode: "137403" },
  { code: "137403008", name: "Forbes Park", cityCode: "137403" },
  { code: "137403009", name: "Guadalupe Nuevo", cityCode: "137403" },
  { code: "137403010", name: "Guadalupe Viejo", cityCode: "137403" },
  { code: "137403011", name: "Kasilawan", cityCode: "137403" },
  { code: "137403012", name: "La Paz", cityCode: "137403" },
  { code: "137403013", name: "Legaspi Village", cityCode: "137403" },
  { code: "137403014", name: "Magallanes", cityCode: "137403" },
  { code: "137403015", name: "Olympia", cityCode: "137403" },
  { code: "137403016", name: "Palanan", cityCode: "137403" },
  { code: "137403017", name: "Pembo", cityCode: "137403" },
  { code: "137403018", name: "Pinagkaisahan", cityCode: "137403" },
  { code: "137403019", name: "Pio del Pilar", cityCode: "137403" },
  { code: "137403020", name: "Pitogo", cityCode: "137403" },
  { code: "137403021", name: "Poblacion", cityCode: "137403" },
  { code: "137403022", name: "Post Proper Northside", cityCode: "137403" },
  { code: "137403023", name: "Post Proper Southside", cityCode: "137403" },
  { code: "137403024", name: "Rizal", cityCode: "137403" },
  { code: "137403025", name: "San Antonio", cityCode: "137403" },
  { code: "137403026", name: "San Isidro", cityCode: "137403" },
  { code: "137403027", name: "San Lorenzo", cityCode: "137403" },
  { code: "137403028", name: "Santa Cruz", cityCode: "137403" },
  { code: "137403029", name: "Singkamas", cityCode: "137403" },
  { code: "137403030", name: "South Cembo", cityCode: "137403" },
  { code: "137403031", name: "Tejeros", cityCode: "137403" },
  { code: "137403032", name: "Urdaneta", cityCode: "137403" },
  { code: "137403033", name: "Valenzuela", cityCode: "137403" },
  { code: "137403034", name: "West Rembo", cityCode: "137403" },

  // Quezon City
  { code: "137414001", name: "Alicia", cityCode: "137414" },
  { code: "137414002", name: "Amihan", cityCode: "137414" },
  { code: "137414003", name: "Apolonio Samson", cityCode: "137414" },
  { code: "137414004", name: "Aurora", cityCode: "137414" },
  { code: "137414005", name: "Baesa", cityCode: "137414" },
  { code: "137414006", name: "Bagbag", cityCode: "137414" },
  { code: "137414007", name: "Bagong Pag-Asa", cityCode: "137414" },
  { code: "137414008", name: "Bagong Silangan", cityCode: "137414" },
  { code: "137414009", name: "Bahay Toro", cityCode: "137414" },
  { code: "137414010", name: "Balingasa", cityCode: "137414" },
  { code: "137414011", name: "Batasan Hills", cityCode: "137414" },
  { code: "137414012", name: "Bayanihan", cityCode: "137414" },
  { code: "137414013", name: "Blue Ridge A", cityCode: "137414" },
  { code: "137414014", name: "Blue Ridge B", cityCode: "137414" },
  { code: "137414015", name: "Botocan", cityCode: "137414" },
  { code: "137414016", name: "Central", cityCode: "137414" },
  { code: "137414017", name: "Claro", cityCode: "137414" },
  { code: "137414018", name: "Commonwealth", cityCode: "137414" },
  { code: "137414019", name: "Culiat", cityCode: "137414" },
  { code: "137414020", name: "Damar", cityCode: "137414" },
  { code: "137414021", name: "Damayan", cityCode: "137414" },
  { code: "137414022", name: "Damayang Lagi", cityCode: "137414" },
  { code: "137414023", name: "Del Monte", cityCode: "137414" },
  { code: "137414024", name: "Diliman", cityCode: "137414" },
  { code: "137414025", name: "Doña Imelda", cityCode: "137414" },
  { code: "137414026", name: "Doña Josefa", cityCode: "137414" },
  { code: "137414027", name: "Don Manuel", cityCode: "137414" },
  { code: "137414028", name: "Duyan-Duyan", cityCode: "137414" },
  { code: "137414029", name: "E. Rodriguez", cityCode: "137414" },
  { code: "137414030", name: "Escopa I", cityCode: "137414" },
  { code: "137414031", name: "Fairview", cityCode: "137414" },
  { code: "137414032", name: "Greater Lagro", cityCode: "137414" },
  { code: "137414033", name: "Gulod", cityCode: "137414" },
  { code: "137414034", name: "Holy Spirit", cityCode: "137414" },
  { code: "137414035", name: "Horseshoe", cityCode: "137414" },
  { code: "137414036", name: "Immaculate Concepcion", cityCode: "137414" },
  { code: "137414037", name: "Kaligayahan", cityCode: "137414" },
  { code: "137414038", name: "Kalusugan", cityCode: "137414" },
  { code: "137414039", name: "Kamuning", cityCode: "137414" },
  { code: "137414040", name: "Katipunan", cityCode: "137414" },
  { code: "137414041", name: "Kaunlaran", cityCode: "137414" },
  { code: "137414042", name: "Kristong Hari", cityCode: "137414" },
  { code: "137414043", name: "Krus Na Ligas", cityCode: "137414" },
  { code: "137414044", name: "Laging Handa", cityCode: "137414" },
  { code: "137414045", name: "Libis", cityCode: "137414" },
  { code: "137414046", name: "Lourdes", cityCode: "137414" },
  { code: "137414047", name: "Loyola Heights", cityCode: "137414" },
  { code: "137414048", name: "Maharlika", cityCode: "137414" },
  { code: "137414049", name: "Malaya", cityCode: "137414" },
  { code: "137414050", name: "Mangga", cityCode: "137414" },

  // Taguig
  { code: "137416001", name: "Bagumbayan", cityCode: "137416" },
  { code: "137416002", name: "Bambang", cityCode: "137416" },
  { code: "137416003", name: "Calzada", cityCode: "137416" },
  { code: "137416004", name: "Central Bicutan", cityCode: "137416" },
  { code: "137416005", name: "Central Signal Village", cityCode: "137416" },
  { code: "137416006", name: "Fort Bonifacio", cityCode: "137416" },
  { code: "137416007", name: "Hagonoy", cityCode: "137416" },
  { code: "137416008", name: "Ibayo-Tipas", cityCode: "137416" },
  { code: "137416009", name: "Ligid-Tipas", cityCode: "137416" },
  { code: "137416010", name: "Lower Bicutan", cityCode: "137416" },
  { code: "137416011", name: "Maharlika Village", cityCode: "137416" },
  { code: "137416012", name: "Napindan", cityCode: "137416" },
  { code: "137416013", name: "New Lower Bicutan", cityCode: "137416" },
  { code: "137416014", name: "North Daang Hari", cityCode: "137416" },
  { code: "137416015", name: "North Signal Village", cityCode: "137416" },
  { code: "137416016", name: "Palingon", cityCode: "137416" },
  { code: "137416017", name: "Pinagsama", cityCode: "137416" },
  { code: "137416018", name: "San Miguel", cityCode: "137416" },
  { code: "137416019", name: "Santa Ana", cityCode: "137416" },
  { code: "137416020", name: "South Daang Hari", cityCode: "137416" },
  { code: "137416021", name: "South Signal Village", cityCode: "137416" },
  { code: "137416022", name: "Tanyag", cityCode: "137416" },
  { code: "137416023", name: "Tuktukan", cityCode: "137416" },
  { code: "137416024", name: "Upper Bicutan", cityCode: "137416" },
  { code: "137416025", name: "Ususan", cityCode: "137416" },
  { code: "137416026", name: "Wawa", cityCode: "137416" },
  { code: "137416027", name: "Western Bicutan", cityCode: "137416" },

  // Pasig
  { code: "137412001", name: "Bagong Ilog", cityCode: "137412" },
  { code: "137412002", name: "Bagong Katipunan", cityCode: "137412" },
  { code: "137412003", name: "Bambang", cityCode: "137412" },
  { code: "137412004", name: "Buting", cityCode: "137412" },
  { code: "137412005", name: "Caniogan", cityCode: "137412" },
  { code: "137412006", name: "Dela Paz", cityCode: "137412" },
  { code: "137412007", name: "Kalawaan", cityCode: "137412" },
  { code: "137412008", name: "Kapasigan", cityCode: "137412" },
  { code: "137412009", name: "Kapitolyo", cityCode: "137412" },
  { code: "137412010", name: "Malinao", cityCode: "137412" },
  { code: "137412011", name: "Manggahan", cityCode: "137412" },
  { code: "137412012", name: "Maybunga", cityCode: "137412" },
  { code: "137412013", name: "Oranbo", cityCode: "137412" },
  { code: "137412014", name: "Palatiw", cityCode: "137412" },
  { code: "137412015", name: "Pinagbuhatan", cityCode: "137412" },
  { code: "137412016", name: "Pineda", cityCode: "137412" },
  { code: "137412017", name: "Rosario", cityCode: "137412" },
  { code: "137412018", name: "Sagad", cityCode: "137412" },
  { code: "137412019", name: "San Antonio", cityCode: "137412" },
  { code: "137412020", name: "San Joaquin", cityCode: "137412" },
  { code: "137412021", name: "San Jose", cityCode: "137412" },
  { code: "137412022", name: "San Miguel", cityCode: "137412" },
  { code: "137412023", name: "San Nicolas", cityCode: "137412" },
  { code: "137412024", name: "Santa Cruz", cityCode: "137412" },
  { code: "137412025", name: "Santa Lucia", cityCode: "137412" },
  { code: "137412026", name: "Santa Rosa", cityCode: "137412" },
  { code: "137412027", name: "Santo Tomas", cityCode: "137412" },
  { code: "137412028", name: "Santolan", cityCode: "137412" },
  { code: "137412029", name: "Sumilang", cityCode: "137412" },
  { code: "137412030", name: "Ugong", cityCode: "137412" },

  // Manila
  { code: "137406001", name: "Binondo", cityCode: "137406" },
  { code: "137406002", name: "Ermita", cityCode: "137406" },
  { code: "137406003", name: "Intramuros", cityCode: "137406" },
  { code: "137406004", name: "Malate", cityCode: "137406" },
  { code: "137406005", name: "Paco", cityCode: "137406" },
  { code: "137406006", name: "Pandacan", cityCode: "137406" },
  { code: "137406007", name: "Port Area", cityCode: "137406" },
  { code: "137406008", name: "Quiapo", cityCode: "137406" },
  { code: "137406009", name: "Sampaloc", cityCode: "137406" },
  { code: "137406010", name: "San Andres", cityCode: "137406" },
  { code: "137406011", name: "San Miguel", cityCode: "137406" },
  { code: "137406012", name: "San Nicolas", cityCode: "137406" },
  { code: "137406013", name: "Santa Ana", cityCode: "137406" },
  { code: "137406014", name: "Santa Cruz", cityCode: "137406" },
  { code: "137406015", name: "Santa Mesa", cityCode: "137406" },
  { code: "137406016", name: "Tondo", cityCode: "137406" },

  // Cebu City
  { code: "072201001", name: "Adlaon", cityCode: "072201" },
  { code: "072201002", name: "Agsungot", cityCode: "072201" },
  { code: "072201003", name: "Apas", cityCode: "072201" },
  { code: "072201004", name: "Babag", cityCode: "072201" },
  { code: "072201005", name: "Bacayan", cityCode: "072201" },
  { code: "072201006", name: "Banilad", cityCode: "072201" },
  { code: "072201007", name: "Basak Pardo", cityCode: "072201" },
  { code: "072201008", name: "Basak San Nicolas", cityCode: "072201" },
  { code: "072201009", name: "Bonbon", cityCode: "072201" },
  { code: "072201010", name: "Budla-an", cityCode: "072201" },
  { code: "072201011", name: "Buhisan", cityCode: "072201" },
  { code: "072201012", name: "Bulacao", cityCode: "072201" },
  { code: "072201013", name: "Buot-Taup", cityCode: "072201" },
  { code: "072201014", name: "Busay", cityCode: "072201" },
  { code: "072201015", name: "Calamba", cityCode: "072201" },
  { code: "072201016", name: "Cambinocot", cityCode: "072201" },
  { code: "072201017", name: "Capitol Site", cityCode: "072201" },
  { code: "072201018", name: "Carreta", cityCode: "072201" },
  { code: "072201019", name: "Central", cityCode: "072201" },
  { code: "072201020", name: "Cogon Pardo", cityCode: "072201" },

  // Davao City
  { code: "112401001", name: "Agdao", cityCode: "112401" },
  { code: "112401002", name: "Bago Aplaya", cityCode: "112401" },
  { code: "112401003", name: "Bago Gallera", cityCode: "112401" },
  { code: "112401004", name: "Bago Oshiro", cityCode: "112401" },
  { code: "112401005", name: "Bajada", cityCode: "112401" },
  { code: "112401006", name: "Baracatan", cityCode: "112401" },
  { code: "112401007", name: "Buhangin", cityCode: "112401" },
  { code: "112401008", name: "Cabantian", cityCode: "112401" },
  { code: "112401009", name: "Calinan", cityCode: "112401" },
  { code: "112401010", name: "Catalunan Grande", cityCode: "112401" },
  { code: "112401011", name: "Catalunan Pequeño", cityCode: "112401" },
  { code: "112401012", name: "Centro", cityCode: "112401" },
  { code: "112401013", name: "Crossing Bayabas", cityCode: "112401" },
  { code: "112401014", name: "Daliao", cityCode: "112401" },
  { code: "112401015", name: "Dumoy", cityCode: "112401" },
  { code: "112401016", name: "Ecoland", cityCode: "112401" },
  { code: "112401017", name: "Langub", cityCode: "112401" },
  { code: "112401018", name: "Ma-a", cityCode: "112401" },
  { code: "112401019", name: "Maa", cityCode: "112401" },
  { code: "112401020", name: "Mabini", cityCode: "112401" },

  // Antipolo
  { code: "045601001", name: "Bagong Nayon", cityCode: "045601" },
  { code: "045601002", name: "Beverly Hills", cityCode: "045601" },
  { code: "045601003", name: "Cupang", cityCode: "045601" },
  { code: "045601004", name: "Dalig", cityCode: "045601" },
  { code: "045601005", name: "Dela Paz", cityCode: "045601" },
  { code: "045601006", name: "Mambugan", cityCode: "045601" },
  { code: "045601007", name: "Mayamot", cityCode: "045601" },
  { code: "045601008", name: "Muntingdilaw", cityCode: "045601" },
  { code: "045601009", name: "San Isidro", cityCode: "045601" },
  { code: "045601010", name: "San Jose", cityCode: "045601" },
  { code: "045601011", name: "San Juan", cityCode: "045601" },
  { code: "045601012", name: "San Luis", cityCode: "045601" },
  { code: "045601013", name: "San Roque", cityCode: "045601" },
  { code: "045601014", name: "Santa Cruz", cityCode: "045601" },
  { code: "045601015", name: "Sta. Cruz", cityCode: "045601" },

  // Calamba
  { code: "043401001", name: "Bagong Kalsada", cityCode: "043401" },
  { code: "043401002", name: "Banadero", cityCode: "043401" },
  { code: "043401003", name: "Banlic", cityCode: "043401" },
  { code: "043401004", name: "Barandal", cityCode: "043401" },
  { code: "043401005", name: "Batino", cityCode: "043401" },
  { code: "043401006", name: "Bubuyan", cityCode: "043401" },
  { code: "043401007", name: "Bucal", cityCode: "043401" },
  { code: "043401008", name: "Bunggo", cityCode: "043401" },
  { code: "043401009", name: "Burol", cityCode: "043401" },
  { code: "043401010", name: "Camaligan", cityCode: "043401" },
  { code: "043401011", name: "Canlubang", cityCode: "043401" },
  { code: "043401012", name: "Halang", cityCode: "043401" },
  { code: "043401013", name: "Hornalan", cityCode: "043401" },
  { code: "043401014", name: "Kay-Anlog", cityCode: "043401" },
  { code: "043401015", name: "Laguerta", cityCode: "043401" },
  { code: "043401016", name: "La Mesa", cityCode: "043401" },
  { code: "043401017", name: "Lawa", cityCode: "043401" },
  { code: "043401018", name: "Lecheria", cityCode: "043401" },
  { code: "043401019", name: "Lingga", cityCode: "043401" },
  { code: "043401020", name: "Looc", cityCode: "043401" },
]

// Helper function to search cities
export function searchCities(query: string): Location[] {
  const normalizedQuery = query.toLowerCase().trim()
  if (!normalizedQuery) return []

  return cities
    .filter(city =>
      city.name.toLowerCase().includes(normalizedQuery) ||
      city.province.toLowerCase().includes(normalizedQuery)
    )
    .slice(0, 20) // Limit results
}

// Helper function to get barangays for a city
export function getBarangaysByCity(cityCode: string): Barangay[] {
  return barangays.filter(b => b.cityCode === cityCode)
}

// Helper function to get city by code
export function getCityByCode(code: string): Location | undefined {
  return cities.find(c => c.code === code)
}
