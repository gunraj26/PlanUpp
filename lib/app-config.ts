// Hardcoded admin ID - this is the only admin user
export const ADMIN_ID = "366ffd3c-0a25-4767-8802-70a5285d9226"

/**
 * Check if a user is the admin
 * @param {Object} user - The user object from auth context
 * @returns {boolean} - True if the user is the admin
 */
export function isAdmin(user) {
  if (!user) return false
  return user.id === ADMIN_ID
}

// Sports data
export const SPORTS = [
  {
    id: "badminton",
    name: "Badminton",
    icon: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "basketball",
    name: "Basketball",
    icon: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "football",
    name: "Football",
    icon: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "tennis",
    name: "Tennis",
    icon: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "volleyball",
    name: "Volleyball",
    icon: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "swimming",
    name: "Swimming",
    icon: "https://images.unsplash.com/photo-1560090995-01632a28895b?q=80&w=500&auto=format&fit=crop",
  },
]

// Facilities data
export const FACILITIES = [
  { id: "bedok-stadium", name: "Bedok Stadium", address: "1, Bedok North Street 2, Singapore 469642" },
  { id: "bishan-sports-centre", name: "Bishan Sports Centre", address: "5, Bishan Street 14, Singapore 579783" },
  {
    id: "bukit-batok-swimming-complex",
    name: "Bukit Batok Swimming Complex",
    address: "2, Bukit Batok Street 22, Singapore 659581",
  },
  {
    id: "bukit-gombak-sports-centre",
    name: "Bukit Gombak Sports Centre",
    address: "800, Bukit Batok West Avenue 5, Singapore 659081",
  },
  {
    id: "bukit-merah-swimming-complex",
    name: "Bukit Merah Swimming Complex",
    address: "314, Bukit Merah Central, Singapore 159944",
  },
  {
    id: "choa-chu-kang-sports-centre",
    name: "Choa Chu Kang Sports Centre",
    address: "1, Choa Chu Kang Street 53, Singapore 689236",
  },
  { id: "clementi-sports-centre", name: "Clementi Sports Centre", address: "518, Clementi Avenue 3, Singapore 129907" },
  { id: "clementi-stadium", name: "Clementi Stadium", address: "10, West Coast Walk, Singapore 127156" },
  { id: "delta-swimming-complex", name: "Delta Swimming Complex", address: "900, Tiong Bahru Road, Singapore 158790" },
  {
    id: "geylang-east-swimming-complex",
    name: "Geylang East Swimming Complex",
    address: "601, Aljunied Avenue 1, Singapore 389862",
  },
  {
    id: "heartbeat-bedok-activesg-gym",
    name: "Heartbeat@Bedok ActiveSG Gym",
    address: "11, Bedok North Street 1, Singapore 469662",
  },
  { id: "hougang-sports-centre", name: "Hougang Sports Centre", address: "93, Hougang Avenue 4, Singapore 538832" },
  { id: "jalan-besar-stadium", name: "Jalan Besar Stadium", address: "100, Tyrwhitt Road, Singapore 207542" },
  {
    id: "jurong-east-sports-centre",
    name: "Jurong East Sports Centre",
    address: "21, Jurong East Street 31, Singapore 609517",
  },
  {
    id: "jurong-west-sports-centre",
    name: "Jurong West Sports Centre",
    address: "20, Jurong West Street 93, Singapore 648965",
  },
  {
    id: "kallang-basin-swimming-complex",
    name: "Kallang Basin Swimming Complex",
    address: "23, Geylang Bahru Lane, Singapore 339628",
  },
  { id: "kallang-sports-centre", name: "Kallang Sports Centre", address: "52, Stadium Road, Singapore 397724" },
  { id: "katong-swimming-complex", name: "Katong Swimming Complex", address: "111, Wilkinson Road, Singapore 436752" },
  { id: "moe-evans-stadium", name: "MOE (Evans) Stadium", address: "21, Evans Road, Singapore 259366" },
  {
    id: "moe-evans-swimming-complex",
    name: "MOE (Evans) Swimming Complex",
    address: "21, Evans Road, Singapore 259366",
  },
  {
    id: "pasir-ris-sports-centre",
    name: "Pasir Ris Sports Centre",
    address: "120, Pasir Ris Central, Singapore 519640",
  },
  { id: "queenstown-sports-centre", name: "Queenstown Sports Centre", address: "473, Stirling Road, Singapore 148948" },
  {
    id: "queenstown-swimming-complex",
    name: "Queenstown Swimming Complex",
    address: "473, Stirling Road, Singapore 148948",
  },
  { id: "sengkang-sports-centre", name: "Sengkang Sports Centre", address: "57, Anchorvale Road, Singapore 544964" },
  {
    id: "serangoon-sports-centre",
    name: "Serangoon Sports Centre",
    address: "33, Yio Chu Kang Road, Singapore 545654",
  },
  { id: "singapore-sports-hub", name: "Singapore Sports Hub", address: "1, Stadium Drive, Singapore 397629" },
  { id: "tampines-sports-centre", name: "Tampines Sports Centre", address: "1, Our Tampines Hub, Singapore 529684" },
  {
    id: "toa-payoh-sports-centre",
    name: "Toa Payoh Sports Centre",
    address: "301, Toa Payoh Lorong 6, Singapore 319392",
  },
  {
    id: "toa-payoh-swimming-complex",
    name: "Toa Payoh Swimming Complex",
    address: "301, Toa Payoh Lorong 6, Singapore 319392",
  },
  {
    id: "woodlands-sports-centre",
    name: "Woodlands Sports Centre",
    address: "2, Woodlands Street 13, Singapore 738599",
  },
  {
    id: "yio-chu-kang-sports-centre",
    name: "Yio Chu Kang Sports Centre",
    address: "200, Ang Mo Kio Avenue 9, Singapore 569770",
  },
  { id: "yishun-sports-centre", name: "Yishun Sports Centre", address: "101, Yishun Avenue 1, Singapore 769130" },
  { id: '  name: "Yishun Sports Centre', address: "101, Yishun Avenue 1, Singapore 769130" },
  { id: "yishun-swimming-complex", name: "Yishun Swimming Complex", address: "101, Yishun Avenue 1, Singapore 769130" },
  {
    id: "zhenghua-park-activesg-gym",
    name: "Zhenghua Park ActiveSG Gym",
    address: "6, Jelapang Road, Singapore 677745",
  },
  { id: "zion-road-swimming-complex", name: "Zion Road Swimming Complex", address: "56, Zion Road, Singapore 159779" },
]

// Helper function to get a default sport image based on the sport
export function getDefaultSportImage(sport) {
  if (!sport) return "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=500&auto=format&fit=crop"

  const sportName = sport.toLowerCase()
  const sportImages = {
    basketball: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=500&auto=format&fit=crop",
    swimming: "https://images.unsplash.com/photo-1560090995-01632a28895b?q=80&w=500&auto=format&fit=crop",
    football: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=500&auto=format&fit=crop",
    tennis: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=500&auto=format&fit=crop",
    volleyball: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=500&auto=format&fit=crop",
    badminton: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=500&auto=format&fit=crop",
  }

  return (
    sportImages[sportName] ||
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=500&auto=format&fit=crop"
  )
}

