import lighthouse from "@lighthouse-web3/sdk";

const LIGHTHOUSE_KEY = process.env.NEXT_PUBLIC_IPFS_KEY  || "";

export const uploadFile = async (file: any) => {
  const output = await lighthouse.upload(file, LIGHTHOUSE_KEY);
  return output.data.Hash;
};


export const uploadText = async (text: string) => {
    const response = await lighthouse.uploadText(text, LIGHTHOUSE_KEY);

    return response.data.Hash;
}