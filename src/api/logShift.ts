// Change this to your backend server's IP and port
const BACKEND_URL = "http://YOUR_SERVER_IP:4000/api/sheet";

export interface LogShiftEventParams {
  timestamp: string;
  machineName: string;
  operatorName: string;
  productType: string;
  action: "start" | "end";
}

export async function logShiftEvent({
  timestamp,
  machineName,
  operatorName,
  productType,
  action,
}: LogShiftEventParams) {
  const row = [
    timestamp,
    machineName,
    operatorName,
    productType,
    action.toUpperCase(),
  ];

  const response = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ row }),
  });

  if (!response.ok) {
    throw new Error("Failed to log shift event");
  }

  return response.json();
}
