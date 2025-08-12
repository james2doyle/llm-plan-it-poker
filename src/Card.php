<?php

namespace Jamesdoyle\SwipePoker;

final class Card
{
    /**
     * @param string[] $name The name of the creature. Example: ["CREATURE NAME", "(ORIGINAL FEATURE NAME)"]
     * @param string $estimated_impact_to_project A measurement of how much this will improve the project. Example: "Medium"
     * @param string $estimated_t_shirt_size_to_build How long this feature might take to build. Example "large", "xlarge"
     * @param string[] $mana_cost Formatted as ["{1}{W}{U}"] or ["{2}{W}", "{1}{B}"]
     * @param string $image_description
     * @param string $card_type "Enchantment", "Artifact", etc.
     * @param string[] $card_subtypes Example ["Oracle", "Weaver"]
     * @param string $card_text The details of the card. Should be easy to tell what the feature is
     * @param string $flavor_text The special quote to use - optionally empty
     * @param int[] $power_defense Optional. Example, "3/5" as [3, 5]
     */
    public function __construct(
        public array $name,
        public string $estimated_impact_to_project,
        public string $estimated_t_shirt_size_to_build,
        public array $mana_cost,
        public string $image_description,
        public string $card_type,
        public array $card_subtypes,
        public string $card_text,
        public string $flavor_text,
        public array $power_defense
    ) {}
}