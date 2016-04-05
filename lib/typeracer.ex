defmodule Typeracer do
  use Application

  def start(_type, _args) do
    import Supervisor.Spec, warn: false

    children = [
      Plug.Adapters.Cowboy.child_spec(:http, nil, [], [
        dispatch: dispatch,
        port: 4444
      ]),
      worker(Typeracer.Pubsub, [])
    ]

    opts = [strategy: :one_for_one, name: Typeracer.Supervisor]
    Supervisor.start_link(children, opts)
  end

  defp dispatch do
    [
      {:_, [
          {"/ws", Typeracer.SockerHandler, []},
          {:_, Plug.Adapters.Cowboy.Handler, {Typeracer.Router, []}}
      ]}
    ]
  end
end

defmodule Typeracer.Message do

end

defmodule Typeracer.SockerHandler do
  alias Typeracer.Pubsub

  def init(_, _req, _opts) do
    {:upgrade, :protocol, :cowboy_websocket}
  end

  def websocket_init(_type, req, _opts) do
    {:ok, req, %{uid: Typeracer.Utils.random_hex}, 120000}
  end

  def websocket_handle({:text, message}, req, %{uid: uid} = state) do
    msg = Poison.decode!(message, as: %{})
    case msg do
      %{"type" => "subscribe", "topic" => topic}
        -> Pubsub.subscribe(self, topic)
      %{"type" => "message", "topic" => topic, "text" => text}
        -> Pubsub.message(topic, text)
      %{"type" => "cast", "topic" => topic, "text" => text}
        -> Pubsub.broadcast_others(topic, uid <> "|" <> text, self)

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
    :ok
  end
end

defmodule Typeracer.Pubsub do
  use GenServer

  def start_link do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  def subscribe(pid, topic) do
    GenServer.cast(__MODULE__, {:sub, pid, topic})
  end

  def message(topic, message) do
    GenServer.cast(__MODULE__, {:msg, topic, message})
  end

  def broadcast_others(topic, message, sender) do
    GenServer.cast(__MODULE__, {:broadcast, topic, message, sender})
  end

  def init(_), do: {:ok, %{}}

  def handle_cast({:broadcast, topic, message, sender}, subs) do
    (for sub <- (subs[topic] || []), sub != sender, do: sub)
    |> Enum.map(fn sub -> send sub, message end)
    {:noreply, subs}
  end

  def handle_cast({:msg, topic, message}, subs) do
    (subs[topic] || [])
    |> Enum.map(fn sub -> send sub, {:message, message} end)
    {:noreply, subs}
  end

  def handle_cast({:sub, pid, topic}, subs) do
    {_, subs} = Map.get_and_update(subs, topic, fn
      nil -> {nil, [pid]}
      x -> {x, [pid|x]}
    end)
    {:noreply, subs}
  end
end

defmodule Typeracer.Router do
  use Plug.Builder

  plug Plug.Static,
  at: "/", from: :typeracer
end

defmodule Typeracer.Nt do
  import Plug.Conn

  @index """
  <!doctype html>
  <html lang=en>
  <meta charset=utf-8>
  <title>tevs</title>
  <script>
  var ws = new WebSocket("ws://" + location.host + "/ws");
  ws.onmessage = x => console.log(x.data)
  </script>
  """

  def init(opts) do
    opts
  end

  def call(conn, opts) do
    send_resp(conn, 200, @index)
  end
end

defmodule Typeracer.Utils do
  @hex "0123456789abcedf"

  def epoch_time do
    :os.system_time(:milli_seconds)
  end

  def random_hex do
    tevs = for <<a::size(4), b::size(4) <- :crypto.strong_rand_bytes(12)>>,
        n <- [a, b],
        do: String.at(@hex, n)

    tevs
    |> to_string
  end
end
