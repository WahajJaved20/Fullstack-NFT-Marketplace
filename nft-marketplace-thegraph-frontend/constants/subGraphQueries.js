import { gql } from "@apollo/client";
const GET_ACTIVE_ITEM = gql`
  {
    activeItems(
      where: { buyer: "0x000000000000000000000000000000000000dead" }
    ) {
      id
      buyer
      seller
      nftAddress
      tokenId
      price
    }
  }
`;
export default GET_ACTIVE_ITEM;
