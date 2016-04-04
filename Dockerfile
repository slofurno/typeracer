FROM bitwalker/alpine-elixir-phoenix:2.0

EXPOSE 4444

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app

RUN npm install
RUN mix deps.get

CMD iex -S mix
