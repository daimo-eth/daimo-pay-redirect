import { baseUSDC } from "@daimo/contract";
import { redirect } from "next/navigation";
import { getAddress, parseUnits } from "viem";
import items from "./items.json";

export default async function GenerateAndRedirect(
  props: {
    searchParams: Promise<{ [key: string]: string }>;
  }
) {
  const searchParams = await props.searchParams;
  // Fixed params for all payers
  const networkSchoolAddress = getAddress("0xCdDc0Ed3dC148a9E5D0a92a3d2015FFDB26b2d53"); // thenetworkschool.eth
  const recipientToken = baseUSDC;

  // Variable params per payer
  const apiKey = searchParams["apiKey"];
  const usd = searchParams["usd"];
  const selectedItemsStr = searchParams["selectedItems"];

  const usdcAmount = parseUnits(usd, recipientToken.decimals);
  const selectedItems = decodeURIComponent(selectedItemsStr).split(",").map(item => items.find(i => item.toLowerCase().trim().startsWith(i.name.toLowerCase())));

  if (!apiKey || !usd || !selectedItemsStr) {
    throw new Error("apiKey, usd and selectedItems are required");
  }

  console.log(`selectedItems: ${JSON.stringify(selectedItems)}`);

  const response = await fetch('https://pay.daimo.com/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': crypto.randomUUID(),
      'Api-Key': apiKey,
    },
    body: JSON.stringify({
      intent: `Pay Network School`,
      items: selectedItems,
      recipient: {
        address: networkSchoolAddress,
        amount: usdcAmount.toString(),
        token: recipientToken.token,
        chain: recipientToken.chainId,
      },
    }),
  });

  const data = await response.json();
  redirect(data.url);
}
