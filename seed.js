import { addReport, getAllReports, getDistinctLocations } from "./db.js";

addReport({ location: "Market Road", text: "Road past the market is flooded, trucks can't pass since this morning.", sourceDevice: "device-A" });
addReport({ location: "Market Road", text: "Water on market road but bikes still getting through on the edge.", sourceDevice: "device-B" });
addReport({ location: "Main Road", text: "Main road clear but very slow, heavy traffic near the junction.", sourceDevice: "device-A" });
addReport({ location: "North Bridge", text: "Bridge looks cracked on the north side, would not risk a loaded truck.", sourceDevice: "device-C" });

console.log("Seeded. Locations:", getDistinctLocations());
console.log("Total reports:", getAllReports().length);