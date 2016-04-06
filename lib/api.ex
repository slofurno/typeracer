defmodule Typeracer.ApiHandler do
  alias Typeracer.Pubsub
  use Plug.Router
  plug :match
  plug :dispatch

  get "/text/:id" do
    {n,_} = Integer.parse(id)
    text = Typeracer.Text.get(n)
    send_resp(conn, 200, text)
  end

  post "/api/race" do
    send_resp(conn, 200, Typeracer.Utils.random_hex)
  end

  post "/api/race/:id" do
    Pubsub.broadcast id, ("start|" <> Typeracer.Text.get_random)
    send_resp(conn, 200, "ok")
  end

  get "/api" do
    send_resp(conn, 200, "world")
  end

  get "/api/:id" do
    send_resp(conn, 200, "world: #{id}")
  end

  get "/api/etc" do
    send_resp(conn, 200, "etc")
  end

  match _ do
    conn
    |> put_resp_header("content-type", "text/html; charset=utf-8")
    |> send_resp(404, "(╯°□°)╯︵ ┻━┻")
  end

end
