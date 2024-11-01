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
  const mealPlanStr = searchParams["mealPlan"];
  const isTest = searchParams["isTest"];
  const submissionId = searchParams["submissionId"];

  const usdcAmount = parseUnits(usd, recipientToken.decimals) / (isTest ? BigInt(100) : BigInt(1));
  const mealPlan = decodeURIComponent(mealPlanStr);
  const daimoPayDisplayItems: typeof items[number][] = [];

  if (selectedItemsStr && selectedItemsStr.length > 0) {
    const selectedItems = decodeURIComponent(selectedItemsStr).split(",").map(item => items.find(i => item.toLowerCase().trim().startsWith(i.name.toLowerCase())));
    if (selectedItems) {
      daimoPayDisplayItems.push(...selectedItems.filter(item => item !== undefined));
    }
  }

  if (mealPlan && mealPlan.length > 0) {
    const mealPlanItem = items.find(i => mealPlan.toLowerCase().startsWith(i.name.split(" ")[0].toLowerCase()));
    if (mealPlanItem) {
      daimoPayDisplayItems.push(mealPlanItem);
    }
  }

  if (!apiKey || !usd || !daimoPayDisplayItems || !submissionId) {
    throw new Error("apiKey, usd, submissionId and selectedItems or mealPlan are required");
  }

  console.log(`daimoPayDisplayItems: ${JSON.stringify(daimoPayDisplayItems)}`);

  const response = await fetch('https://pay.daimo.com/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': submissionId,
      'Api-Key': apiKey,
    },
    body: JSON.stringify({
      style: {
        background: "",
      },
      orgLogo: "https://daimo-pay-redirect.vercel.app/ns.svg",
      intent: `Pay Network School`,
      items: daimoPayDisplayItems,
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
