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
    IO.inspect("init")
    #send self(), {:message, "generated message"}
    #Typeracer.Pubsub.subscribe(self())
    {:ok, req, %{}, 60000}
  end

  def websocket_handle({:text, message}, req, state) do
    msg = Poison.decode!(message, as: %{})
    case msg do
      %{"type" => "subscribe", "topic" => topic} -> Pubsub.subscribe(self, topic)
      %{"type" => "message", "topic" => topic, "text" => text} -> Pubsub.message(topic, text)
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
  use GenEvent

  def start_link do
    ret = GenEvent.start(name: __MODULE__)
    GenEvent.add_handler(__MODULE__, Typeracer.Pubsub, [])
    ret
  end

  def subscribe(pid, topic) do
    GenEvent.notify(__MODULE__, {:sub, pid, topic})
  end

  def message(topic, message) do
    GenEvent.notify(__MODULE__, {:msg, topic, message})
  end

  def init(_), do: {:ok, %{}}

  def handle_event({:msg, topic, message}, subs) do
    (subs[topic] || [])
    |> Enum.map(fn sub -> send sub, {:message, message} end)

    {:ok, subs}
  end

  def handle_event({:sub, pid, topic}, subs) do
    #IO.inspect(pid)
    #Enum.map(subs, fn x -> send x, {:message, "someone connected"} end)
    {_, subs} = Map.get_and_update(subs, topic, fn
      nil -> {nil, [pid]}
      x -> {x, [pid|x]}
    end)
    {:ok, subs}
  end
end

defmodule Typeracer.Router do
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
