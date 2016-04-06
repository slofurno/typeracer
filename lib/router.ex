
defmodule Typeracer.Router do
  use Plug.Builder

  plug :serve_index

  plug Plug.Static,
  at: "/", from: :typeracer

  plug Typeracer.ApiHandler

  defp serve_index(%Plug.Conn{path_info: []} = conn, opts) do
    %{conn | path_info: ["index.html"]}
  end

  defp serve_index(conn, opts), do: conn

end
