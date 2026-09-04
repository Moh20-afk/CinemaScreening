import type { Franchise } from "@/lib/types";

export const franchises: Franchise[] = [
  {
    id: "harry-potter",
    name: "Harry Potter",
    filmIds: [
      "hp-philosophers-stone",
      "hp-chamber-of-secrets",
      "hp-prisoner-of-azkaban",
      "hp-goblet-of-fire",
      "hp-order-of-the-phoenix",
      "hp-half-blood-prince",
      "hp-deathly-hallows-1",
      "hp-deathly-hallows-2",
    ],
    description:
      "The complete wizarding saga — from Platform 9 3/4 to the Battle of Hogwarts.",
  },
  {
    id: "lord-of-the-rings",
    name: "The Lord of the Rings",
    filmIds: ["lotr-fellowship", "lotr-two-towers", "lotr-return"],
    description: "Peter Jackson's Middle-earth trilogy, built for the big screen.",
  },
  {
    id: "star-wars",
    name: "Star Wars",
    filmIds: ["a-new-hope", "empire-strikes-back", "return-of-the-jedi"],
    description: "The original trilogy. A long time ago, returning to cinemas.",
  },
  {
    id: "hunger-games",
    name: "The Hunger Games",
    filmIds: ["hunger-games", "catching-fire", "mockingjay-1", "mockingjay-2"],
    description: "May the odds be ever in your favour — the full Panem saga.",
  },
  {
    id: "twilight",
    name: "Twilight",
    filmIds: ["twilight", "new-moon"],
    description: "The saga that filled multiplexes. Track it for a revival.",
  },
  {
    id: "james-bond",
    name: "James Bond",
    filmIds: ["casino-royale", "skyfall"],
    description: "007 on the big screen. Track the films you still want to see.",
  },
  {
    id: "studio-ghibli",
    name: "Studio Ghibli",
    filmIds: ["spirited-away", "my-neighbor-totoro"],
    description: "Ghibli classics in the dark, as they were meant to be seen.",
  },
];

export function getFranchiseById(id: string): Franchise | undefined {
  return franchises.find((franchise) => franchise.id === id);
}
