defmodule Typeracer.Pubsub do
  use GenServer

  def start_link do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  def subscribe(pid, topic) do
    GenServer.cast(__MODULE__, {:sub, pid, topic})
  end

  def unsubscribe(pid, topic) do
    GenServer.cast(__MODULE__, {:unsub, pid, topic})
  end

  def message(topic, message) do
    GenServer.cast(__MODULE__, {:msg, topic, message})
  end

  def broadcast(topic, message) do
    GenServer.cast(__MODULE__, {:msg, topic, message})
  end

  def broadcast_others(topic, message, sender) do
    GenServer.cast(__MODULE__, {:broadcast, topic, message, sender})
  end

  def init(_), do: {:ok, %{}}

  def handle_cast({:broadcast, topic, message, sender}, subs) do
    for sub <- (subs[topic] || []), sub != sender do
      send sub, message
    end

    {:noreply, subs}
  end

  def handle_cast({:msg, topic, message}, subs) do
    for sub <- (subs[topic] || []) do
      send sub, {:message, message}
    end

    {:noreply, subs}
  end

  def handle_cast({:unsub, sender, topic}, subs) do
    newsubs = for sub <- (subs[topic] || []), sub != sender, do: sub
    {:noreply, %{subs | topic => newsubs}}
  end

  def handle_cast({:sub, pid, topic}, subs) do
    {_, subs} = Map.get_and_update(subs, topic, fn
      nil -> {nil, [pid]}
      x -> {x, [pid|x]}
    end)

    {:noreply, subs}
  end
end
