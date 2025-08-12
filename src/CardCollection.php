<?php

namespace Jamesdoyle\SwipePoker;

use Illuminate\Contracts\Support\Jsonable;
use Illuminate\Contracts\Support\Renderable;
use Stringable;

final class CardCollection implements Jsonable, Renderable, Stringable
{
    /**
     * @param Card[] $cards
     */
    public function __construct(
        public array $cards,
    ) {}

    /**
     * Converts the object to a JSON string.
     *
     * @return string
     * @throws JsonException
     */
    public function toJson($options = 0): string
    {
        return json_encode(get_object_vars($this), $options);
    }

    /**
     * Get the evaluated contents of the object.
     *
     * @return string
     */
    public function render() {
        return $this->toJson();
    }

    public function __toString(): string {
        return $this->toJson();
    }
}