defmodule TyperacerTest do
  use ExUnit.Case, async: true
  alias Typeracer.Pubsub
  doctest Typeracer

  test "the truth" do
    assert 1 + 1 == 2
  end

  setup_all do
    Pubsub.start_link
    :ok
  end

  test "sub and broadcast others" do
    Pubsub.subscribe(self, "broadcast_others")
    Pubsub.broadcast_others("broadcast_others", "hi", self)
    refute_receive {:message, "hi"}, 500
    :ok
  end

  test "sub and unsub" do
    Pubsub.subscribe(self, "test")
    Pubsub.broadcast("test", "hi")
    assert_receive {:message, "hi"}

    Pubsub.unsubscribe(self, "test")
    Pubsub.broadcast("test", "hi")

    refute_receive {:message, "hi"}, 500
    :ok
  end

end
