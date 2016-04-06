defmodule Typeracer.SockerHandler do
  alias Typeracer.Pubsub

  def init(_, _req, _opts) do
    {:upgrade, :protocol, :cowboy_websocket}
  end

  defp extract_qs({_,_,_,_,_,_,_,_,_,_,_,_,_,qs,_,_,_,_,_,_,_,_,_,_,_,_,_,_}) do

  end

  #TODO: heartbeat instead of longer timeout
  def websocket_init(_type, req, _opts) do
    {_,_,_,_,_,_,_,_,_,_,_,_,_,qs,_,_,_,_,_,_,_,_,_,_,_,_,_,_} = req
    IO.inspect qs
    {:ok, req, %{uid: Typeracer.Utils.random_hex}, 480000}
  end

  def websocket_handle({:text, message}, req, %{uid: uid} = state) do
    msg = Poison.decode!(message, as: %{})
    case msg do
      %{"type" => "subscribe", "topic" => topic} ->
        Pubsub.subscribe(self, topic)

      %{"type" => "message", "topic" => topic, "text" => text} ->
        Pubsub.message(topic, text)

      %{"type" => "cast", "topic" => topic, "text" => text} ->
        Pubsub.broadcast_others(topic, "keypress|#{uid}|" <> text, self)

      _ -> IO.inspect(msg)
    end

    {:ok, req, state}
  end

  def websocket_info({:message, message}, req, state) do
    IO.inspect(message)
    {:reply, {:text, message}, req, state}
  end

  def websocket_info(message, req, state) do
    {:reply, {:text, message}, req, state}
  end


  def websocket_terminate(_reason, _req, _state) do
    IO.inspect "websocket d/c"
    :ok
  end
end
