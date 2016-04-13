defmodule Typeracer do
  use Application

  defp get_port do
    {port, _} = System.get_env("PORT0") |> Integer.parse
    port
  end

  def start(_type, _args) do
    import Supervisor.Spec, warn: false

    children = [
      Plug.Adapters.Cowboy.child_spec(:http, nil, [], [
        dispatch: dispatch,
        port: (get_port || 4444)
      ]),
      worker(Typeracer.Pubsub, []),
      worker(Typeracer.Text, [])
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


