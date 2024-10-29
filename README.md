This is a simple Next.js project set up to make API calls and redirects for [Daimo Pay](https://pay.daimo.com).

See [./src/app/ns-food](./src/app/ns-food/) for an API call + Redirect:

URLs look like `https://daimo-pay-redirect.vercel.app/ns-food/?apiKey=[INSERT_API_KEY]&usd=[INSERT USD COST]&selectedItems=[INSERT FILLOUT PICTURE CHOICE INPUT]`.

To add or change checkout display items, edit [items.json](./src/app/ns-food/items.json).

To add or change destination, see [page.tsx](./src/app/ns-food/page.tsx).

We are happy to accept any changes or PRs.

## Dev

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
