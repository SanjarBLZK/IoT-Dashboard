import { Rack, RackReading, RackStatus, Incident } from "../types";

// Helper: Random waarde binnen range
export function randomBetween(min: number, max: number, decimals = 1): number {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

// Status afleiden van temperatuur
export function deriveStatus(temp: number): RackStatus {
  if (temp >= 35) return "critical";
  if (temp >= 28) return "warn";
  return "ok";
}

// Timestamp formatteren
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Volledige datum/tijd formatteren
export function formatDateTime(date: Date): string {
  return date.toLocaleString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// Genereer historische data voor een rack (60 metingen = 30 minuten bij 30sec interval)
export function generateHistoricalData(
  baseTemp: number,
  baseHumidity: number
): RackReading[] {
  const now = new Date();
  const history: RackReading[] = [];

  for (let i = 59; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 30000); // 30 seconden terug
    history.push({
      time: formatTime(timestamp),
      temp: baseTemp + randomBetween(-2, 2),
      humidity: baseHumidity + randomBetween(-3, 3),
    });
  }

  return history;
}

// Initiële rack data
export function createInitialRacks(): Rack[] {
  return [
    {
      id: 1,
      name: "Rack A",
      location: "Noordzijde",
      type: "server",
      temp: 24.5,
      humidity: 45,
      status: "ok",
      history: generateHistoricalData(24.5, 45),
      devices: [
        "Dell PowerEdge R740",
        "HP ProLiant DL380 Gen10",
        "Cisco Catalyst 9300",
        "NetApp FAS2750",
      ],
    },
    {
      id: 2,
      name: "Rack B",
      location: "Centrale rij",
      type: "network",
      temp: 29.2,
      humidity: 52,
      status: "warn",
      history: generateHistoricalData(29.2, 52),
      devices: [
        "Cisco Nexus 9000",
        "Juniper EX4300",
        "Arista 7050X3",
        "Palo Alto PA-5220",
      ],
    },
    {
      id: 3,
      name: "Rack C",
      location: "Zuidzijde",
      type: "server",
      temp: 26.8,
      humidity: 48,
      status: "ok",
      history: generateHistoricalData(26.8, 48),
      devices: [
        "HPE Apollo 6500 Gen10",
        "Dell PowerEdge R640",
        "EMC VNX5400",
        "Eaton 9PX UPS",
        "Dell PowerVault MD3400",
      ],
    },
  ];
}

// Sample foto's voor bewegingsdetectie
export const samplePhotos = [
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1551808525-51a94da548ce?w=400&h=400&fit=crop",
];

// Update rack met nieuwe sensor reading
export function updateRackWithNewReading(rack: Rack): Rack {
  const drift = randomBetween(-0.4, 0.4);
  const newTemp = rack.temp + drift;
  const newHumidity = rack.humidity + randomBetween(-0.3, 0.3);
  const newStatus = deriveStatus(newTemp);

  const newReading: RackReading = {
    time: formatTime(new Date()),
    temp: newTemp,
    humidity: newHumidity,
  };

  return {
    ...rack,
    temp: newTemp,
    humidity: newHumidity,
    status: newStatus,
    history: [...rack.history.slice(-59), newReading], // Rolling window van 60
  };
}

// Genereer random motion incident
export function createMotionIncident(id: number): Incident {
  return {
    id,
    time: formatDateTime(new Date()),
    type: "motion",
    message: "Beweging gedetecteerd in serverruimte",
    photo: samplePhotos[Math.floor(Math.random() * samplePhotos.length)],
  };
}

// Genereer temperature alarm incident
export function createTemperatureAlarm(id: number, rackId: number, rackName: string): Incident {
  return {
    id,
    time: formatDateTime(new Date()),
    type: "alarm",
    rack: rackId,
    message: `Kritieke temperatuur gedetecteerd in ${rackName}`,
  };
}
