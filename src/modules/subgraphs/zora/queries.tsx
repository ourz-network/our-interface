/* eslint-disable no-param-reassign */
import { DocumentNode, gql } from "@apollo/client"; // graphql query language

// Collect all users and creation ids
// export const ZORA_CREATIONS_BY_USER = gql`
//   {
//     users {
//       creations {
//         id
//       }
//     }
//   }
// `;

/**
 * Returns gql query to retrieve specific Zora post
 * @param {Number} id post infromation to retrieve
 * @returns {gql} query with template string embedded
 */
export const ZORA_MEDIA_BY_ID = (id: number): DocumentNode => gql`
  {
    media(id:"${id}") {
      id,
      owner { id },
      creator { id },
      contentURI,
      metadataURI,
      creatorBidShare
      reserveAuctions {
        id
      }
    }
  }
  `;

/**
 * Returns gql query to retrieve all Zora posts by owner
 * @param {String} owner address
 * @returns {gql} query with template string embedded
 */
export const ZORA_MEDIA_BY_OWNER = (owner: string): DocumentNode => {
  owner = owner.toString().toLowerCase();
  return gql`
    {
      medias(where: { owner: "${owner}" }) {
        id
        owner { id }
        creator { id }
        contentURI
        metadataURI
        creatorBidShare
        createdAtTimestamp
      }
    }
  `;
};

/**
 * Returns gql query to retrieve all Zora posts by creator
 * @param {String} creator address
 * @returns {gql} query with template string embedded
 */
export const ZORA_MEDIA_BY_CREATOR = (creator: string): DocumentNode => {
  creator = creator.toString().toLowerCase();
  return gql`
    {
      medias(where: { creator: "${creator}" }) {
        id
        owner { id }
        creator { id }
        contentURI
        metadataURI
        creatorBidShare
        createdAtTimestamp
      }
    }
  `;
};
