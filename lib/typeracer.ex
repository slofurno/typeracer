defmodule Typeracer do
  use Application

  def start(_type, _args) do
    import Supervisor.Spec, warn: false

    children = [
      Plug.Adapters.Cowboy.child_spec(:http, nil, [], [
        dispatch: dispatch,
        port: 4444
      ])
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

defmodule Typeracer.SockerHandler do
  def init(_, _req, _opts) do
    {:upgrade, :protocol, :cowboy_websocket}
  end

  def websocket_init(_type, req, _opts) do
    {:ok, req, %{}, 60000}
  end

  def websocket_handle({:text, message}, req, state) do
    IO.inspect(message)
    {:ok, req, state}
  end

  def websocket_info(message, req, state) do
    {:reply, {:text, message}, req, state}
  end

  def websocket_terminate(_reason, _req, _state) do
    :ok
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
  ws.onmessage = x => console.log(x)
  </script>
  """
  def init(opts) do
    opts
  end

  def call(conn, opts) do
    send_resp(conn, 200, @index)
  end
end
